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

    // Check if username exists in account JSONB column
    const { data, error } = await supabase
      .from("users_duplicate")
      .select("uid")
      .or(`account->>username.eq.${trimmedUsername},username.eq.${trimmedUsername}`)
      .limit(1);

    if (error) {
      console.error("[check-username] Database error:", error);
      return NextResponse.json(
        { available: false, error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    const available = !data || data.length === 0;

    return NextResponse.json({ available });
  } catch (error) {
    console.error("[check-username] Error:", error);
    return NextResponse.json(
      { available: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
