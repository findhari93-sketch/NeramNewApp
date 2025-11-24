/**
 * Branded email verification template for Neram Classes
 * Features:
 * - Neram Classes logo
 * - Brand colors (Pink #FF105E, Purple #88206D, Yellow #FFFB01)
 * - Professional button CTA
 * - Personalized student name
 * - 48-hour expiry notice
 */

interface VerificationEmailParams {
  studentName: string;
  verificationLink: string;
  email: string;
}

export function generateVerificationEmailHTML({
  studentName,
  verificationLink,
  email,
}: VerificationEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Neram Classes</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #88206D 0%, #FF105E 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #88206D;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      margin-bottom: 20px;
    }
    .highlight {
      background-color: #FFFB01;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
      color: #88206D;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF105E 0%, #88206D 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 30px 0;
      box-shadow: 0 4px 12px rgba(255, 16, 94, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 16, 94, 0.4);
    }
    .features {
      background-color: #f9f9f9;
      border-left: 4px solid #FF105E;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .features h3 {
      color: #88206D;
      font-size: 18px;
      margin: 0 0 15px 0;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .features li {
      margin-bottom: 8px;
      color: #555555;
      line-height: 1.5;
    }
    .link-fallback {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #eeeeee;
    }
    .link-fallback p {
      font-size: 14px;
      color: #666666;
      margin-bottom: 10px;
    }
    .link-url {
      word-break: break-all;
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      color: #666666;
      border: 1px solid #e0e0e0;
    }
    .expiry-notice {
      background-color: #fff9e6;
      border: 1px solid #FFFB01;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #88206D;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 30px 20px;
      text-align: center;
      font-size: 13px;
      color: #999999;
    }
    .footer a {
      color: #FF105E;
      text-decoration: none;
    }
    .footer .brand-name {
      color: #88206D;
      font-weight: 600;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #88206D;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .message {
        font-size: 15px;
      }
      .cta-button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="https://neramclasses.com/images/email%20images/social/logo.png" alt="Neram Classes" class="logo" />
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="greeting">Hi ${studentName},</div>

      <p class="message">
        Thanks for creating a <span class="highlight">neramclasses.com</span> account!
      </p>

      <p class="message">
        Confirming your account will give you full access to <strong>neramclasses.com</strong> -
        India's No. 1 AI-powered Architecture entrance exam learning app features, and all future
        notifications will be sent to <strong>${email}</strong>.
      </p>

      <p class="message">
        To continue, verify your email address by clicking the button below:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${verificationLink}" class="cta-button">
          Verify Email Address
        </a>
      </div>

      <!-- Expiry Notice -->
      <div class="expiry-notice">
        ⏰ <strong>This link is valid for the next 48 hours.</strong>
        After that, you'll need to request a new verification email.
      </div>

      <!-- Features Box -->
      <div class="features">
        <h3>What you'll get access to:</h3>
        <ul>
          <li>AI-powered personalized learning paths</li>
          <li>Comprehensive NATA & B.Arch entrance exam preparation</li>
          <li>Interactive practice tests and mock exams</li>
          <li>Expert-curated study materials and video lessons</li>
          <li>Real-time progress tracking and analytics</li>
          <li>Community support and doubt resolution</li>
        </ul>
      </div>

      <!-- Link Fallback -->
      <div class="link-fallback">
        <p>
          <strong>Having trouble clicking the button?</strong><br>
          Copy and paste the link below into your browser:
        </p>
        <div class="link-url">${verificationLink}</div>
      </div>

      <p class="message" style="margin-top: 30px; font-size: 14px; color: #666666;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        Thanks,<br>
        <span class="brand-name">Your Neram Classes Team</span>
      </p>

      <div class="social-links">
        <a href="https://neramclasses.com">Website</a> •
        <a href="https://neramclasses.com/about">About Us</a> •
        <a href="https://neramclasses.com/contact">Contact</a> •
        <a href="https://neramclasses.com/privacy">Privacy Policy</a>
      </div>

      <p style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} Neram Classes. All rights reserved.<br>
        India's Leading Architecture Entrance Exam Preparation Platform
      </p>

      <p style="margin-top: 15px; font-size: 11px; color: #bbbbbb;">
        This email was sent to ${email} because you created an account on neramclasses.com.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateVerificationEmailText({
  studentName,
  verificationLink,
  email,
}: VerificationEmailParams): string {
  return `
Hi ${studentName},

Thanks for creating a neramclasses.com account!

Confirming your account will give you full access to neramclasses.com - India's No. 1 AI-powered Architecture entrance exam learning app features, and all future notifications will be sent to ${email}.

To continue, verify your email address by clicking the link below:

${verificationLink}

This link is valid for the next 48 hours. After that, you'll need to request a new verification email.

What you'll get access to:
- AI-powered personalized learning paths
- Comprehensive NATA & B.Arch entrance exam preparation
- Interactive practice tests and mock exams
- Expert-curated study materials and video lessons
- Real-time progress tracking and analytics
- Community support and doubt resolution

If you didn't create this account, you can safely ignore this email.

Thanks,
Your Neram Classes Team

---
© ${new Date().getFullYear()} Neram Classes. All rights reserved.
India's Leading Architecture Entrance Exam Preparation Platform

This email was sent to ${email} because you created an account on neramclasses.com.
  `.trim();
}
