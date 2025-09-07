import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";
import crypto from "crypto";

// Server-side LinkedIn callback route
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    // const state = url.searchParams.get("state"); // state can be used for CSRF verification
    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/login?error=missing_code", url.origin)
      );
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL("/auth/login?error=not_configured", url.origin)
      );
    }

    // Exchange code for access token
    const tokenRes = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );
    if (!tokenRes.ok) {
      return NextResponse.redirect(
        new URL("/auth/login?error=token_failed", url.origin)
      );
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;

    // Fetch basic profile
    const profileRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return NextResponse.redirect(
        new URL("/auth/login?error=profile_failed", url.origin)
      );
    }
    const profile = await profileRes.json();

    // Fetch email
    const emailRes = await fetch(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    let email = null;
    if (emailRes.ok) {
      const em = await emailRes.json();
      email = em?.elements?.[0]?.["handle~"]?.emailAddress || null;
    }

    // Upsert into Supabase users table and store LinkedIn access token
    try {
      const expiresIn = tokenJson.expires_in
        ? Number(tokenJson.expires_in)
        : null;
      const expiresAt = expiresIn
        ? Math.floor(Date.now() / 1000) + expiresIn
        : null;
      // store refresh_token if provided
      const refreshToken = tokenJson.refresh_token || null;
      await supabase.from("users").upsert(
        {
          linkedin_id: profile.id,
          email,
          linkedin_access_token: accessToken,
          linkedin_refresh_token: refreshToken,
          linkedin_token_expires_at: expiresAt,
        },
        { onConflict: "linkedin_id" }
      );
    } catch {
      console.warn("supabase upsert failed");
    }

    // Create a signed session cookie (HMAC-SHA256)
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      const resNoSecret = NextResponse.redirect(
        new URL("/auth/login?linkedin=success", url.origin)
      );
      resNoSecret.cookies.set("linkedin_signed_in", "1", {
        httpOnly: true,
        maxAge: 60 * 5,
      });
      return resNoSecret;
    }

    const payload = { provider: "linkedin", id: profile.id, email };
    const payloadJson = JSON.stringify(payload);
    const base = Buffer.from(payloadJson, "utf8").toString("base64url");
    let signature = "";
    try {
      signature = crypto
        .createHmac("sha256", secret)
        .update(base)
        .digest("base64url");
    } catch {
      signature = "";
    }

    const sessionToken = `${base}.${signature}`;
    const resSigned = NextResponse.redirect(
      new URL("/auth/login?linkedin=success", url.origin)
    );
    const secure = process.env.NODE_ENV === "production";
    resSigned.cookies.set("neram_session", sessionToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secure,
    });
    return resSigned;
  } catch {
    return NextResponse.redirect(
      new URL("/auth/login?error=exception", new URL(req.url).origin)
    );
  }
}
