/**
 * API Route: Start User Session
 * POST /api/sessions/start
 *
 * Initializes a new user session and returns the session ID.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
  StartSessionRequest,
  StartSessionResponse,
} from "@/types/session";

// Initialize Supabase client with service role (server-side only)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body: StartSessionRequest = await request.json();
    const { userId, section = "initial_load", deviceInfo } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json<StartSessionResponse>(
        { ok: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from("users_duplicate")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json<StartSessionResponse>(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Call database function to start session
    const { data, error } = await supabase.rpc("start_user_session", {
      p_user_id: userId,
      p_section: section,
      p_device_info: deviceInfo || null,
    });

    if (error) {
      console.error("[sessions/start] Database error:", error);
      return NextResponse.json<StartSessionResponse>(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // data is the session ID
    const sessionId = data as string;

    console.log(
      `[sessions/start] Session started: ${sessionId} for user: ${userId}`
    );

    return NextResponse.json<StartSessionResponse>({
      ok: true,
      sessionId,
    });
  } catch (error) {
    console.error("[sessions/start] Error:", error);
    return NextResponse.json<StartSessionResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
