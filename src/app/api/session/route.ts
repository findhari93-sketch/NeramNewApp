import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/neram_session=([^;]+)/);
    if (!match)
      return NextResponse.json(
        { ok: false, error: "no_session" },
        { status: 401 }
      );
    const token = decodeURIComponent(match[1]);
    const [base, signature] = token.split(".");
    const secret = process.env.SESSION_SECRET;
    if (!secret)
      return NextResponse.json(
        { ok: false, error: "no_secret" },
        { status: 500 }
      );
    const expected = crypto
      .createHmac("sha256", secret)
      .update(base)
      .digest("base64url");
    if (!signature || signature !== expected)
      return NextResponse.json(
        { ok: false, error: "invalid_signature" },
        { status: 401 }
      );
    const payloadJson = Buffer.from(base, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as {
      provider: string;
      id: string;
      email?: string;
    };
    // Lookup user in Supabase
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("linkedin_id", payload.id)
      .limit(1)
      .maybeSingle();
    return NextResponse.json({ ok: true, user: data || null });
  } catch {
    return NextResponse.json(
      { ok: false, error: "exception" },
      { status: 500 }
    );
  }
}
