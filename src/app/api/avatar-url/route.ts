import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseServer } from "c:/Users/Haribabu/Documents/AppsCopilot/Neram/NeramNextApp/neram-nextjs-app/src/lib/supabaseServer";

// GET /api/avatar-url?userId=<id>&expires=60
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const expires = Number(url.searchParams.get("expires") || "60");

    if (!userId)
      return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Try users table first (we store avatar_path in users.avatar_path)
    const { data: userRow, error: uErr } = await supabaseServer
      .from("users")
      .select("avatar_path")
      .eq("firebase_uid", userId)
      .single();

    let avatarPath: string | null = null;
    if (!uErr && userRow && userRow.avatar_path) {
      avatarPath = userRow.avatar_path as string;
    } else {
      // fallback to legacy `profiles` table for compatibility
      const { data: profile, error: pErr } = await supabaseServer
        .from("profiles")
        .select("avatar_path")
        .eq("id", userId)
        .single();
      if (!pErr && profile && profile.avatar_path)
        avatarPath = profile.avatar_path;
    }

    if (!avatarPath) return new NextResponse(null, { status: 204 });

    // create signed url
    const { data, error } = await supabaseServer.storage
      .from("avatars")
      .createSignedUrl(avatarPath, expires);

    if (error) {
      console.error("createSignedUrl error", error);
      return NextResponse.json(
        { error: "failed to create signed url" },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data?.signedUrl });
  } catch (err) {
    console.error("avatar-url error", err);
    return NextResponse.json({ error: "unexpected" }, { status: 500 });
  }
}
