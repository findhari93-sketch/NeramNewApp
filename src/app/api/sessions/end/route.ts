/**
 * API Route: End User Session
 * POST /api/sessions/end
 *
 * Ends an active session and calculates duration.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { EndSessionRequest, EndSessionResponse } from "@/types/session";

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
    // Handle both JSON and FormData (for sendBeacon compatibility)
    let sessionId: string;
    let metadata: Record<string, unknown> | undefined;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body: EndSessionRequest = await request.json();
      sessionId = body.sessionId;
      metadata = body.metadata;
    } else {
      // Handle sendBeacon (comes as blob)
      const text = await request.text();
      try {
        const parsed: EndSessionRequest = JSON.parse(text);
        sessionId = parsed.sessionId;
        metadata = parsed.metadata;
      } catch {
        return NextResponse.json<EndSessionResponse>(
          { ok: false, error: "Invalid request format" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json<EndSessionResponse>(
        { ok: false, error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Call database function to end session
    const { error } = await supabase.rpc("end_user_session", {
      p_session_id: sessionId,
      p_metadata: metadata || null,
    });

    if (error) {
      console.error("[sessions/end] Database error:", error);
      return NextResponse.json<EndSessionResponse>(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`[sessions/end] Session ended: ${sessionId}`);

    return NextResponse.json<EndSessionResponse>({
      ok: true,
    });
  } catch (error) {
    console.error("[sessions/end] Error:", error);
    return NextResponse.json<EndSessionResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
