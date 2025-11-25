/**
 * API Route: Log Session Event
 * POST /api/sessions/log-event
 *
 * Logs a custom event within an active session.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { LogEventRequest, LogEventResponse } from "@/types/session";

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
    const body: LogEventRequest = await request.json();
    const { sessionId, eventType, eventData } = body;

    // Validate required fields
    if (!sessionId || !eventType) {
      return NextResponse.json<LogEventResponse>(
        { ok: false, error: "sessionId and eventType are required" },
        { status: 400 }
      );
    }

    // Call database function to log event
    const { data, error } = await supabase.rpc("log_session_event", {
      p_session_id: sessionId,
      p_event_type: eventType,
      p_event_data: eventData || null,
    });

    if (error) {
      console.error("[sessions/log-event] Database error:", error);
      return NextResponse.json<LogEventResponse>(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // data is the event ID
    const eventId = data as string;

    return NextResponse.json<LogEventResponse>({
      ok: true,
      eventId,
    });
  } catch (error) {
    console.error("[sessions/log-event] Error:", error);
    return NextResponse.json<LogEventResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
