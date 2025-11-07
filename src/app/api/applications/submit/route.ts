import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    console.log("[Submit API] Request received");

    const body = await request.json();
    const { userId, firebaseUid } = body;

    if (!userId && !firebaseUid) {
      console.error("[Submit API] Missing userId or firebaseUid");
      return NextResponse.json(
        { error: "userId or firebaseUid required" },
        { status: 400 }
      );
    }

    // Fetch user data from Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[Submit API] Looking up user with:", { userId, firebaseUid });

    // First try to get user by ID if provided, otherwise by firebase_uid in account JSONB
    let user = null;
    let fetchError = null;

    if (userId) {
      const result = await supabase
        .from("users_duplicate")
        .select("*")
        .eq("id", userId)
        .single();
      user = result.data;
      fetchError = result.error;
    } else if (firebaseUid) {
      // Query the JSONB column for firebase_uid
      const result = await supabase
        .from("users_duplicate")
        .select("*")
        .contains("account", { firebase_uid: firebaseUid })
        .single();
      user = result.data;
      fetchError = result.error;
    }

    if (fetchError || !user) {
      console.error("[Submit API] User not found:", fetchError);
      return NextResponse.json(
        { error: "User not found", details: fetchError?.message },
        { status: 404 }
      );
    }

    console.log("[Submit API] User data fetched:", {
      id: user.id,
      email: user.contact?.email,
      name: user.basic?.student_name,
    });

    // Get Azure AD token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.AZ_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.AZ_CLIENT_ID!,
          client_secret: process.env.AZ_CLIENT_SECRET!,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      }
    );

    if (!tokenRes.ok) {
      const tokenError = await tokenRes.text();
      console.error("[Submit API] Token fetch failed:", tokenError);
      return NextResponse.json(
        { error: "Failed to get Azure token", details: tokenError },
        { status: 500 }
      );
    }

    const tokenData = await tokenRes.json();
    console.log("[Submit API] Azure token acquired");

    // Build email HTML
    const adminLink = `https://neram.co.in/nexus/admin/applications/${user.id}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #667eea; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { font-weight: bold; min-width: 150px; color: #555; }
    .info-value { color: #333; }
    .button { display: inline-block; background: #667eea; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🎓 New Application Submitted</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Neram Nexus Admin Notification</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Account Information</div>
        <div class="info-row">
          <span class="info-label">Application ID:</span>
          <span class="info-value">${user.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Firebase UID:</span>
          <span class="info-value">${user.account?.firebase_uid || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Username:</span>
          <span class="info-value">${user.account?.username || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Account Type:</span>
          <span class="info-value">${user.account?.account_type || "-"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Contact Details</div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${user.contact?.email || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${user.contact?.phone || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Alt Phone:</span>
          <span class="info-value">${user.contact?.alt_phone || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Instagram:</span>
          <span class="info-value">${user.contact?.instagram || "-"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="info-row">
          <span class="info-label">Student Name:</span>
          <span class="info-value">${user.basic?.student_name || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Father's Name:</span>
          <span class="info-value">${user.basic?.father_name || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Gender:</span>
          <span class="info-value">${user.basic?.gender || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span class="info-value">${
            [
              user.contact?.city,
              user.contact?.state,
              user.contact?.country,
              user.contact?.zip_code,
            ]
              .filter(Boolean)
              .join(", ") || "-"
          }</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Education Details</div>
        <div class="info-row">
          <span class="info-label">Education Type:</span>
          <span class="info-value">${
            user.education?.education_type || "-"
          }</span>
        </div>
        <div class="info-row">
          <span class="info-label">Board:</span>
          <span class="info-value">${user.education?.board || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">School/College:</span>
          <span class="info-value">${
            user.education?.school_name ||
            user.education?.college_name ||
            user.education?.diploma_college ||
            "-"
          }</span>
        </div>
        <div class="info-row">
          <span class="info-label">Year:</span>
          <span class="info-value">${
            user.education?.board_year ||
            user.education?.college_year ||
            user.education?.diploma_year ||
            "-"
          }</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Course Selection</div>
        <div class="info-row">
          <span class="info-label">Selected Course:</span>
          <span class="info-value">${user.selected_course || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">NATA Attempt Year:</span>
          <span class="info-value">${user.nata_attempt_year || "-"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Submission Details</div>
        <div class="info-row">
          <span class="info-label">Submitted At:</span>
          <span class="info-value">${new Date(
            user.created_at_tz || Date.now()
          ).toLocaleString()}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${adminLink}" class="button">
          📋 View Full Application in Admin Panel
        </a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from Neram Nexus Admin System.</p>
      <p>© ${new Date().getFullYear()} Neram. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email via Microsoft Graph
    const message = {
      message: {
        subject: `🎓 New Application: ${
          user.basic?.student_name || "Unknown"
        } - ${user.selected_course || "No course"}`,
        body: {
          contentType: "HTML",
          content: emailHtml,
        },
        toRecipients: [
          {
            emailAddress: {
              address: process.env.ADMIN_EMAIL!,
            },
          },
        ],
      },
      saveToSentItems: true,
    };

    console.log("[Submit API] Sending email to:", process.env.ADMIN_EMAIL);

    const mailRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        process.env.AZ_SENDER_USER!
      )}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    if (!mailRes.ok) {
      const mailError = await mailRes.text();
      console.error("[Submit API] Email send failed:", mailError);
      return NextResponse.json(
        { error: "Failed to send email", details: mailError },
        { status: 500 }
      );
    }

    console.log("[Submit API] Email sent successfully!");

    // Mark application as submitted in the user's application_details JSONB column
    try {
      const now = new Date().toISOString();
      const existingAppDetails = user.application_details || {};

      const updatedAppDetails = {
        ...existingAppDetails,
        application_submitted: true,
        app_submitted_date_time: now,
      };

      const updateRes = await supabase
        .from("users_duplicate")
        .update({ application_details: updatedAppDetails })
        .eq("id", user.id)
        .select()
        .single();

      if (updateRes.error) {
        console.error(
          "[Submit API] Failed to update application_details:",
          updateRes.error
        );
        return NextResponse.json(
          {
            error: "Failed to update application status",
            details: updateRes.error.message,
          },
          { status: 500 }
        );
      }

      console.log(
        "[Submit API] application_details updated for user:",
        user.id
      );
    } catch (err: any) {
      console.error(
        "[Submit API] Unexpected error updating application_details:",
        err
      );
      return NextResponse.json(
        {
          error: "Failed to update application status",
          details: err?.message || String(err),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted and admin notified",
    });
  } catch (error: any) {
    console.error("[Submit API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
