export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * GET /api/users/check-username
 * Checks if a username is available
 * Query params: username
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { available: false, error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { available: false, error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if username exists in both account JSONB column and top-level username column
    // Query both the JSONB path and the top-level username column

    console.log("[check-username] Checking username:", trimmedUsername);

    // First check account.username (JSONB)
    const accountCheck = await supabase
      .from("users_duplicate")
      .select("uid")
      .not("account", "is", null)
      .filter("account->>username", "eq", trimmedUsername)
      .limit(1);

    if (accountCheck.error) {
      console.error("[check-username] Account JSONB check error:", accountCheck.error);
    }

    // Also check top-level username column
    const usernameCheck = await supabase
      .from("users_duplicate")
      .select("uid")
      .eq("username", trimmedUsername)
      .limit(1);

    if (usernameCheck.error) {
      console.error("[check-username] Username column check error:", usernameCheck.error);
    }

    // If either check has an error that's not "column doesn't exist", return error
    if (accountCheck.error && !accountCheck.error.message?.includes("does not exist")) {
      return NextResponse.json(
        { available: false, error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    if (usernameCheck.error && !usernameCheck.error.message?.includes("does not exist")) {
      return NextResponse.json(
        { available: false, error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    // Username is taken if found in either location
    const foundInAccount = accountCheck.data && accountCheck.data.length > 0;
    const foundInUsername = usernameCheck.data && usernameCheck.data.length > 0;
    const available = !foundInAccount && !foundInUsername;

    console.log("[check-username] Result:", { available, foundInAccount, foundInUsername });

    return NextResponse.json({ available });
  } catch (error) {
    console.error("[check-username] Error:", error);
    return NextResponse.json(
      { available: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
