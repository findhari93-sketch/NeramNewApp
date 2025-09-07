import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";
import crypto from "crypto";

function parseSession(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/neram_session=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const [base, signature] = token.split(".");
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(base)
    .digest("base64url");
  if (!signature || signature !== expected) return null;
  const payloadJson = Buffer.from(base, "base64url").toString("utf8");
  return JSON.parse(payloadJson) as {
    provider: string;
    id: string;
    email?: string;
  };
}

export async function GET(req: Request) {
  try {
    const session = parseSession(req);
    if (!session)
      return NextResponse.json(
        { ok: false, error: "no_session" },
        { status: 401 }
      );
    // lookup refresh token
    const { data } = await supabase
      .from("users")
      .select("linkedin_refresh_token")
      .eq("linkedin_id", session.id)
      .maybeSingle();
    const refreshToken = data?.linkedin_refresh_token;
    if (!refreshToken)
      return NextResponse.json(
        { ok: false, error: "no_refresh" },
        { status: 400 }
      );

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      return NextResponse.json(
        { ok: false, error: "not_configured" },
        { status: 500 }
      );

    const tokenRes = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );
    if (!tokenRes.ok)
      return NextResponse.json(
        { ok: false, error: "refresh_failed" },
        { status: 502 }
      );
    const tokenJson = await tokenRes.json();
    const newAccess = tokenJson.access_token as string;
    const expiresIn = tokenJson.expires_in
      ? Number(tokenJson.expires_in)
      : null;
    const expiresAt = expiresIn
      ? Math.floor(Date.now() / 1000) + expiresIn
      : null;

    // update Supabase
    await supabase
      .from("users")
      .update({
        linkedin_access_token: newAccess,
        linkedin_token_expires_at: expiresAt,
      })
      .eq("linkedin_id", session.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "exception" },
      { status: 500 }
    );
  }
}
