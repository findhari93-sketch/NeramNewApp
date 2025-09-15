import { NextResponse } from "next/server";
import supabaseServer from "../../../../lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = body?.event || "unknown";
    const payload = {
      event,
      payload: body,
      created_at: new Date().toISOString(),
    } as any;

    // Try to insert into analytics.events if the table exists. If it fails,
    // fall back to logging to server console.
    try {
      const { error } = await supabaseServer
        .from("analytics.events")
        .insert([payload]);
      if (error) {
        console.warn(
          "supabase analytics insert failed",
          error.message || error
        );
      }
    } catch (e) {
      console.warn("analytics insert error", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("analytics endpoint error", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
