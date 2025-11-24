import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

/**
 * Test endpoint to verify SendGrid configuration in production
 *
 * Usage:
 * - Development: http://localhost:3000/api/test-email?to=your-email@example.com
 * - Production: https://neramclasses.com/api/test-email?to=your-email@example.com
 *
 * Security: Remove or protect this endpoint before going live
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get("to") || "test@example.com";

    // Log current environment
    console.log("[test-email] Environment check:", {
      NODE_ENV: process.env.NODE_ENV,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_SECURE: process.env.SMTP_SECURE,
      MAIL_FROM: process.env.MAIL_FROM,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      hasSmtpPass: !!process.env.SMTP_PASS,
      passLength: process.env.SMTP_PASS?.length || 0,
      timestamp: new Date().toISOString(),
    });

    // Attempt to send test email
    const result = await sendMail({
      to: toEmail,
      subject: `Production Email Test - ${new Date().toISOString()}`,
      text: `This is a test email from your production environment.

If you receive this email, your SendGrid configuration is working correctly!

Environment: ${process.env.NODE_ENV}
Timestamp: ${new Date().toISOString()}
From: ${process.env.MAIL_FROM}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e1148b;">✅ Email Test Successful!</h1>
          <p>If you're reading this, your SendGrid configuration is working correctly in production.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Environment Details:</h3>
            <ul>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV}</li>
              <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>From Email:</strong> ${process.env.MAIL_FROM}</li>
              <li><strong>App URL:</strong> ${
                process.env.NEXT_PUBLIC_APP_URL
              }</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. You can safely delete it.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      emailSentTo: toEmail,
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        MAIL_FROM: process.env.MAIL_FROM,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        hasSmtpPass: !!process.env.SMTP_PASS,
        passLength: process.env.SMTP_PASS?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[test-email] Failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          SMTP_HOST: process.env.SMTP_HOST,
          SMTP_PORT: process.env.SMTP_PORT,
          SMTP_USER: process.env.SMTP_USER,
          MAIL_FROM: process.env.MAIL_FROM,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
          hasSmtpPass: !!process.env.SMTP_PASS,
          passLength: process.env.SMTP_PASS?.length || 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
