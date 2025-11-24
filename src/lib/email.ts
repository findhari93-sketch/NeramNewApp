import nodemailer from "nodemailer";

export type MailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
};

export function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  // Log configuration (mask password for security)
  console.log("[email] SMTP Configuration:", {
    host,
    port,
    secure,
    hasUser: !!user,
    hasPass: !!pass,
    passLength: pass?.length || 0,
    environment: process.env.NODE_ENV,
  });

  if (!host || !user || !pass) {
    const missingVars = [];
    if (!host) missingVars.push("SMTP_HOST");
    if (!user) missingVars.push("SMTP_USER");
    if (!pass) missingVars.push("SMTP_PASS");

    const error = `SMTP not configured. Missing: ${missingVars.join(", ")}`;
    console.error("[email] Configuration error:", error);
    throw new Error(error);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // Enable debug logging in development
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  });

  return transporter;
}

export async function sendMail(opts: MailOptions) {
  const from =
    process.env.MAIL_FROM ||
    process.env.FROM_EMAIL ||
    "no-reply@neramclasses.com";

  console.log("[email] Sending email:", {
    from,
    to: opts.to,
    subject: opts.subject,
    hasHtml: !!opts.html,
    hasText: !!opts.text,
    attachmentCount: opts.attachments?.length || 0,
  });

  try {
    const transporter = getTransport();

    // Verify connection before sending
    await transporter.verify();
    console.log("[email] SMTP connection verified successfully");

    const info = await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments as any,
    });

    console.log("[email] Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return info;
  } catch (error) {
    console.error("[email] Failed to send email:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      to: opts.to,
      subject: opts.subject,
    });
    throw error;
  }
}
