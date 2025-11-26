import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";
import admin from "firebase-admin";

// initialize firebase-admin with service account if not already
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
      // Fallback to discrete env vars if JSON parsing fails
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
      if (projectId && clientEmail && privateKey) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        } catch (err) {
          console.warn(
            "Failed to init Firebase Admin from discrete envs after JSON parse error",
            err
          );
        }
      }
    }
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } catch (e) {
        console.warn("Failed to init Firebase Admin from discrete envs", e);
      }
    }
  }
}

// Example server-side upload handler for /api/upload/avatar
// - This implementation expects a SUPABASE_SERVICE_KEY env and uses @supabase/supabase-js
// - Replace with your provider (S3, Cloudinary, etc.) if you do not use Supabase
// - It accepts multipart/form-data with a `file` field and returns { photoURL }

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    // Next's experimental request.formData() is available in newer runtimes.
    // Use it to get the uploaded file. If missing, return 400.
    if (!("formData" in req)) {
      return NextResponse.json(
        { error: "Runtime does not support formData()" },
        { status: 500 }
      );
    }

    // NextRequest may have formData() in the runtime; keep a runtime check above
    const form = await (req as any).formData();
    const file = form.get("file") as any;
    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Note: buffer will be created later after validation to measure size

    // We'll upload to a private 'avatars' bucket and store the storage path
    // in the user's profile (profiles.avatar_path). The client should pass
    // an Authorization: Bearer <firebase id token> header (or you can rely
    // on Supabase auth if the client is authenticated with Supabase).

    // Identify the user from an Authorization header (Bearer Firebase ID token)
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Authorization Bearer token" },
        { status: 401 }
      );
    }
    const token = authHeader.slice(7);
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      if (decoded && decoded.uid) userId = decoded.uid;
    } catch (err) {
      console.warn("upload/avatar: token verification failed", err);
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user identification after token verification" },
        { status: 401 }
      );
    }

    // Basic file validation: only images and size limit
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

    // If the incoming File exposes a size property prefer that, otherwise derive
    const fileSize =
      typeof (file as any).size === "number" ? (file as any).size : null;
    // If size not available, convert to buffer to measure size
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const measuredSize = fileSize ?? buffer.byteLength;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    if (measuredSize > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max size is ${MAX_BYTES} bytes` },
        { status: 400 }
      );
    }

    // construct a filename under avatars/<userId>/<random>.<ext>
    const ext = (file.name && file.name.split(".").pop()) || "bin";
    // Use crypto to generate a compact random filename
    const rand = crypto.getRandomValues(new Uint32Array(4)).join("");
    const filename = `avatars/${userId}/${rand}.${ext}`;

    // Upload to private bucket (ensure bucket 'avatars' exists and is private)
    const uploadRes = await supabaseServer.storage
      .from("avatars")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadRes.error) {
      console.error("supabase upload error", uploadRes.error);
      return NextResponse.json(
        { error: uploadRes.error.message },
        { status: 500 }
      );
    }

    // Update avatar_path in both users and users_duplicate tables by matching firebase_uid
    try {
      // Update old users table (for backward compatibility)
      const { data: updateData, error: updateErr } = await supabaseServer
        .from("users")
        .update({ avatar_path: filename })
        .eq("firebase_uid", userId)
        .select("id");

      if (updateErr) {
        console.error("users avatar_path update error", updateErr);
      } else if (
        !updateData ||
        (Array.isArray(updateData) && updateData.length === 0)
      ) {
        console.warn("No users row matched firebase_uid", userId);
      }

      // Update users_duplicate table (account.avatar_path in JSONB)
      // First, fetch the existing row to merge with
      const { data: existingUser, error: fetchErr } = await supabaseServer
        .from("users_duplicate")
        .select("account")
        .filter("account->>firebase_uid", "eq", userId)
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        console.error("users_duplicate fetch error", fetchErr);
      } else if (existingUser) {
        // Merge avatar_path into existing account JSONB
        const updatedAccount = {
          ...(existingUser.account || {}),
          avatar_path: filename,
        };

        const { error: updateDuplicateErr } = await supabaseServer
          .from("users_duplicate")
          .update({ account: updatedAccount })
          .filter("account->>firebase_uid", "eq", userId);

        if (updateDuplicateErr) {
          console.error("users_duplicate avatar_path update error", updateDuplicateErr);
        }
      } else {
        console.warn("No users_duplicate row matched firebase_uid", userId);
      }
    } catch (e) {
      console.error("avatar_path update unexpected", e);
    }

    // Create a short-lived signed URL so the client can display the image immediately
    try {
      const expires = 300; // seconds (5 minutes)
      const { data: signedData, error: signedErr } =
        await supabaseServer.storage
          .from("avatars")
          .createSignedUrl(filename, expires);
      if (signedErr) {
        console.error("createSignedUrl error after upload", signedErr);
        return NextResponse.json({ path: filename }, { status: 200 });
      }
      return NextResponse.json({
        path: filename,
        signedUrl: signedData?.signedUrl,
      });
    } catch (e) {
      console.error("signed url creation error", e);
      return NextResponse.json({ path: filename }, { status: 200 });
    }

    // Return the storage path only — the client should call the signed-url
    // endpoint to retrieve the image when needed.
    return NextResponse.json({ path: filename });
  } catch (err: any) {
    console.error("upload avatar route error", err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
