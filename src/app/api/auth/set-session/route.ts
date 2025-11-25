/**
 * API Route: Set Session Cookie
 * POST /api/auth/set-session
 *
 * Sets a secure httpOnly session cookie with the Firebase ID token.
 * This prevents XSS attacks by keeping tokens out of localStorage.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "firebase-admin";

// Initialize Firebase Admin (same pattern as other routes)
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
      if (projectId && clientEmail && privateKey) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        } catch (err) {
          console.warn(
            "Failed to init Firebase Admin from discrete envs after JSON parse error",
            err
          );
        }
      }
    }
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } catch (e) {
        console.warn("Failed to init Firebase Admin from discrete envs", e);
      }
    }
  }
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "idToken is required" },
        { status: 400 }
      );
    }

    // Verify the token before setting cookie
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("[set-session] Token verification failed:", error);
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Create session cookie (5 days expiry, same as Firebase default)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

    try {
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn });

      // Set secure httpOnly cookie
      const cookieStore = await cookies();
      cookieStore.set("firebase_session", sessionCookie, {
        maxAge: expiresIn / 1000, // in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("[set-session] Session cookie creation failed:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to create session" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[set-session] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Clear session cookie on DELETE
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("firebase_session");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[set-session] Error clearing session:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
