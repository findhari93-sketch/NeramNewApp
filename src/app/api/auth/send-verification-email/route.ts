import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { sendMail } from "../../../../lib/email";
import {
  generateVerificationEmailHTML,
  generateVerificationEmailText,
} from "../../../../lib/emailTemplates/verificationEmail";

// Initialize Firebase Admin if not already initialized
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
          console.warn("Failed to init Firebase Admin", err);
        }
      }
    }
  }
}

/**
 * POST /api/auth/send-verification-email
 *
 * Sends a branded email verification email to the user
 *
 * Body:
 * - email: User's email address
 * - studentName?: Optional student name (extracted from email if not provided)
 *
 * Returns:
 * - ok: true if email sent successfully
 * - error: Error message if failed
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, studentName } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Get the user by email from Firebase Auth
    let firebaseUser: admin.auth.UserRecord;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (e) {
      console.error("User not found in Firebase Auth:", e);
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (firebaseUser.emailVerified) {
      return NextResponse.json(
        { ok: false, error: "Email already verified" },
        { status: 400 }
      );
    }

    // Extract student name from email if not provided
    // Example: harrybabu93@gmail.com -> harrybabu93
    const extractedName =
      studentName || email.split("@")[0] || "Student";

    // Capitalize first letter of the name
    const formattedStudentName =
      extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

    // Generate email verification link using Firebase Admin SDK
    // This link will expire in 48 hours (172800000 ms)
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://neramclasses.com"}/auth/action?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    let verificationLink: string;
    try {
      verificationLink = await admin
        .auth()
        .generateEmailVerificationLink(email, actionCodeSettings);
    } catch (e) {
      console.error("Failed to generate verification link:", e);
      return NextResponse.json(
        { ok: false, error: "Failed to generate verification link" },
        { status: 500 }
      );
    }

    // Generate branded HTML and text email content
    const htmlContent = generateVerificationEmailHTML({
      studentName: formattedStudentName,
      verificationLink,
      email,
    });

    const textContent = generateVerificationEmailText({
      studentName: formattedStudentName,
      verificationLink,
      email,
    });

    // Send email via Nodemailer
    try {
      await sendMail({
        to: email,
        subject: "Verify your email - Neram Classes",
        text: textContent,
        html: htmlContent,
      });

      console.log(`[send-verification-email] Email sent to ${email}`);

      return NextResponse.json({
        ok: true,
        message: "Verification email sent successfully",
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { ok: false, error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? "unknown error");
    console.error("/api/auth/send-verification-email error:", message, err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
