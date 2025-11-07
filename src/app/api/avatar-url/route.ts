import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

// GET /api/avatar-url?userId=<id>&expires=60
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const expires = Number(url.searchParams.get("expires") || "60");

    if (!userId)
      return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Try users_duplicate table first (avatar_path is in account JSONB)
    const { data: userRow, error: uErr } = await supabaseServer
      .from("users_duplicate")
      .select("account")
      .filter("account->>firebase_uid", "eq", userId)
      .single();

    let avatarPath: string | null = null;
    if (!uErr && userRow && userRow.account) {
      const account = userRow.account as any;
      avatarPath = account.avatar_path || null;
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
