/**
 * API Route: Get Session Statistics
 * GET /api/sessions/stats?userId=xxx&daysBack=30
 *
 * Returns aggregated session statistics for a user.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { GetStatsResponse, SessionStats } from "@/types/session";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const daysBack = parseInt(searchParams.get("daysBack") || "30", 10);

    // Validate required fields
    if (!userId) {
      return NextResponse.json<GetStatsResponse>(
        { ok: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Call database function to get stats
    const { data, error } = await supabase.rpc("get_user_session_stats", {
      p_user_id: userId,
      p_days_back: daysBack,
    });

    if (error) {
      console.error("[sessions/stats] Database error:", error);
      return NextResponse.json<GetStatsResponse>(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // data is an array with a single row
    const stats = (data && data[0]) as SessionStats | null;

    if (!stats) {
      return NextResponse.json<GetStatsResponse>(
        { ok: false, error: "No stats found" },
        { status: 404 }
      );
    }

    return NextResponse.json<GetStatsResponse>({
      ok: true,
      stats,
    });
  } catch (error) {
    console.error("[sessions/stats] Error:", error);
    return NextResponse.json<GetStatsResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
