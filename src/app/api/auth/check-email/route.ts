import { NextResponse } from "next/server";
import supabaseServer from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    if (!email)
      return NextResponse.json(
        { ok: false, error: "missing_email" },
        { status: 400 }
      );

    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("account")
      .filter("contact->>email", "ilike", email)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("/api/auth/check-email supabase error", error);
      return NextResponse.json(
        { ok: false, error: "db_error" },
        { status: 500 }
      );
    }
    if (!data) return NextResponse.json({ ok: true, providers: [] });

    // providers is stored in account JSONB
    const account = data.account as any;
    const providers = Array.isArray(account?.providers)
      ? account.providers
      : [];
    return NextResponse.json({ ok: true, providers });
  } catch (err) {
    console.error("/api/auth/check-email error", err);
    return NextResponse.json(
      { ok: false, error: "exception" },
      { status: 500 }
    );
  }
}
