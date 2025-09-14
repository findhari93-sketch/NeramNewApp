import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Only initialize once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * POST /api/auth/mark-email-verified
 * Body: { uid: string }
 * Requires admin credentials (server-side only)
 */
export async function POST(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: "Missing uid" },
        { status: 400 }
      );
    }
    await getAuth().updateUser(uid, { emailVerified: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error marking email verified:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
