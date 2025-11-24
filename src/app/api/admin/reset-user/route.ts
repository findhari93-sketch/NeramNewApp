import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
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
          console.warn("Failed to init Firebase Admin", err);
        }
      }
    }
  }
}

/**
 * DELETE /api/admin/reset-user?email=xxx
 *
 * Deletes a user from Firebase Auth to allow them to sign up again
 * ONLY USE IN DEVELOPMENT - REMOVE IN PRODUCTION
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // SECURITY: Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "This endpoint is disabled in production" },
        { status: 403 }
      );
    }

    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);

      // Delete the user from Firebase Auth
      await admin.auth().deleteUser(userRecord.uid);

      console.log(`✓ Deleted Firebase Auth user: ${email} (${userRecord.uid})`);

      return NextResponse.json({
        ok: true,
        message: `User ${email} has been deleted from Firebase Auth. You can now sign up again with this email.`,
        deletedUid: userRecord.uid,
      });
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        return NextResponse.json(
          { ok: false, error: `User with email ${email} not found in Firebase Auth` },
          { status: 404 }
        );
      }
      throw e;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err ?? "unknown error");
    console.error("/api/admin/reset-user error:", message, err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
