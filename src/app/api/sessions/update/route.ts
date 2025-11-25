/**
 * API Route: Update Session Section
 * POST /api/sessions/update
 *
 * Updates the current section of an active session.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
  UpdateSectionRequest,
  UpdateSectionResponse,
} from "@/types/session";

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
    const body: UpdateSectionRequest = await request.json();
    const { sessionId, section, metadata } = body;

    // Validate required fields
    if (!sessionId || !section) {
      return NextResponse.json<UpdateSectionResponse>(
        { ok: false, error: "sessionId and section are required" },
        { status: 400 }
      );
    }

    // Call database function to update section
    const { error } = await supabase.rpc("update_session_section", {
      p_session_id: sessionId,
      p_new_section: section,
      p_metadata: metadata || null,
    });

    if (error) {
      console.error("[sessions/update] Database error:", error);
      return NextResponse.json<UpdateSectionResponse>(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(
      `[sessions/update] Section updated for session: ${sessionId} -> ${section}`
    );

    return NextResponse.json<UpdateSectionResponse>({
      ok: true,
    });
  } catch (error) {
    console.error("[sessions/update] Error:", error);
    return NextResponse.json<UpdateSectionResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
