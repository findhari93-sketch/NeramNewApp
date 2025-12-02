export async function getGraphToken(): Promise<string | null> {
  const { AZ_TENANT_ID, AZ_CLIENT_ID, AZ_CLIENT_SECRET } = process.env;
  if (!AZ_TENANT_ID || !AZ_CLIENT_ID || !AZ_CLIENT_SECRET) {
    console.warn('[Email Service] Azure AD credentials not configured');
    return null;
  }
  const tokenUrl = `https://login.microsoftonline.com/${AZ_TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: AZ_CLIENT_ID,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: AZ_CLIENT_SECRET,
    grant_type: 'client_credentials',
  });
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!response.ok) {
    console.error('[Email Service] Failed to get Graph token');
    return null;
  }
  const data = await response.json();
  return data.access_token;
}

export async function sendEmailWithAttachment(
  graphToken: string,
  toEmail: string,
  subject: string,
  htmlBody: string,
  attachmentBuffer: Buffer,
  attachmentName: string
): Promise<void> {
  const { AZ_SENDER_USER, HELP_DESK_EMAIL } = process.env;
  if (!AZ_SENDER_USER) {
    throw new Error('AZ_SENDER_USER not configured');
  }
  const endpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(AZ_SENDER_USER)}/sendMail`;
  const base64Attachment = attachmentBuffer.toString('base64');
  const payload = {
    message: {
      subject,
      body: { contentType: 'HTML', content: htmlBody },
      toRecipients: [{ emailAddress: { address: toEmail } }],
      replyTo: HELP_DESK_EMAIL ? [{ emailAddress: { address: HELP_DESK_EMAIL } }] : [],
      bccRecipients: HELP_DESK_EMAIL ? [{ emailAddress: { address: HELP_DESK_EMAIL } }] : [],
      attachments: [{ '@odata.type': '#microsoft.graph.fileAttachment', name: attachmentName, contentType: 'application/pdf', contentBytes: base64Attachment }],
    },
    saveToSentItems: true,
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${graphToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${errorText}`);
  }
}

export function generateInvoiceEmailHTML(data: {
  studentName: string;
  courseName: string;
  amountPaid: number;
  paymentId: string;
  invoiceNumber: string;
  paymentDate: string;
}): string {
  const helpDeskEmail = process.env.HELP_DESK_EMAIL || 'support@neram.co.in';
  const amountStr = new Intl.NumberFormat('en-IN').format(data.amountPaid);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:#4a148c;color:#fff;padding:30px 20px;text-align:center}.header h1{margin:0;font-size:24px}.success-icon{font-size:48px;margin:20px 0}.content{padding:30px 20px}.content h2{color:#4a148c;margin-top:0}.details-box{background:#f9f9f9;padding:20px;border-left:4px solid #4caf50;margin:20px 0}.details-row{display:flex;justify-content:space-between;margin:10px 0}.details-label{font-weight:bold;color:#666}.details-value{color:#333}.amount-box{background:#4caf50;color:#fff;padding:20px;text-align:center;margin:20px 0;border-radius:5px}.amount-box .label{font-size:14px;margin-bottom:5px}.amount-box .amount{font-size:32px;font-weight:bold}.attachment-info{background:#fff3cd;border:1px solid #ffc107;padding:15px;border-radius:5px;margin:20px 0}.next-steps{background:#e3f2fd;padding:20px;border-radius:5px;margin:20px 0}.next-steps h3{color:#1976d2;margin-top:0}.next-steps ul{margin:10px 0;padding-left:20px}.footer{background:#f5f5f5;padding:20px;text-align:center;color:#666;font-size:12px}.btn{display:inline-block;padding:12px 30px;background:#4a148c;color:#fff;text-decoration:none;border-radius:5px;margin:10px 0}</style></head><body><div class="container"><div class="header"><div class="success-icon">✅</div><h1>Payment Successful!</h1><p>Your invoice is ready</p></div><div class="content"><h2>Dear ${data.studentName},</h2><p>Thank you for your payment! We're excited to have you enrolled in our course.</p><div class="amount-box"><div class="label">Amount Paid</div><div class="amount">₹${amountStr}</div></div><div class="details-box"><div class="details-row"><span class="details-label">Invoice Number:</span><span class="details-value">${data.invoiceNumber}</span></div><div class="details-row"><span class="details-label">Payment ID:</span><span class="details-value">${data.paymentId}</span></div><div class="details-row"><span class="details-label">Course:</span><span class="details-value">${data.courseName}</span></div><div class="details-row"><span class="details-label">Payment Date:</span><span class="details-value">${formatEmailDate(data.paymentDate)}</span></div></div><div class="attachment-info"><strong>📎 Invoice Attached</strong><br>Your detailed invoice is attached to this email as a PDF document. Please save it for your records.</div><div class="next-steps"><h3>What's Next?</h3><ul><li>You will receive course access details within 24 hours</li><li>Check your email for the class schedule and meeting links</li><li>Save this invoice for your records</li><li>Contact us if you have any questions</li></ul></div><p style="text-align:center;"><a href="https://neramclasses.com/dashboard" class="btn">Go to Dashboard</a></p><p>If you have any questions, please contact us at <a href="mailto:${helpDeskEmail}">${helpDeskEmail}</a> or call +91 91761 37043.</p><p>Best regards,<br><strong>Team neramClasses</strong></p></div><div class="footer"><p>This is an automated email. Please do not reply to this email.</p><p>© 2025 neramClasses.com. All rights reserved.</p></div></div></body></html>`;
}

function formatEmailDate(isoDate: string): string {
  try { const d = new Date(isoDate); return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); } catch { return isoDate; }
}

/**
 * Send admin notification email for new payment
 */
export async function sendAdminPaymentNotification(params: {
  studentName: string;
  studentEmail: string;
  courseName: string;
  amountPaid: number;
  paymentId: string;
  orderId: string;
  paymentMethod: string;
  paymentDate: string;
  applicationId: string;
}): Promise<void> {
  try {
    const graphToken = await getGraphToken();
    if (!graphToken) {
      console.error('[Admin Email] Cannot send admin email: Graph token not available');
      return;
    }

    const adminEmails = process.env.ADMIN_EMAILS || process.env.HELP_DESK_EMAIL;
    if (!adminEmails) {
      console.error('[Admin Email] No admin emails configured (ADMIN_EMAILS or HELP_DESK_EMAIL)');
      return;
    }

    const emailList = adminEmails.split(',').map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) {
      console.error('[Admin Email] Admin email list is empty');
      return;
    }

    const amountStr = new Intl.NumberFormat('en-IN').format(params.amountPaid);
    const subject = `New Payment Received: ₹${amountStr} - ${params.studentName}`;

    const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:#1976d2;color:#fff;padding:30px 20px;text-align:center}.header h1{margin:0;font-size:24px}.icon{font-size:48px;margin:20px 0}.content{padding:30px 20px}.content h2{color:#1976d2;margin-top:0}.details-box{background:#f9f9f9;padding:20px;border-left:4px solid #4caf50;margin:20px 0}.details-row{display:flex;justify-content:space-between;margin:10px 0;padding:5px 0;border-bottom:1px solid #eee}.details-label{font-weight:bold;color:#666}.details-value{color:#333}.amount-box{background:#4caf50;color:#fff;padding:20px;text-align:center;margin:20px 0;border-radius:5px}.amount-box .label{font-size:14px;margin-bottom:5px}.amount-box .amount{font-size:32px;font-weight:bold}.action-box{background:#fff3cd;border:1px solid #ffc107;padding:15px;border-radius:5px;margin:20px 0}.btn{display:inline-block;padding:12px 30px;background:#1976d2;color:#fff;text-decoration:none;border-radius:5px;margin:10px 5px}.footer{background:#f5f5f5;padding:20px;text-align:center;color:#666;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="icon">💰</div><h1>New Payment Received</h1><p>Admin Notification</p></div><div class="content"><h2>Payment Details</h2><div class="amount-box"><div class="label">Amount Received</div><div class="amount">₹${amountStr}</div></div><div class="details-box"><div class="details-row"><span class="details-label">Student Name:</span><span class="details-value">${params.studentName}</span></div><div class="details-row"><span class="details-label">Student Email:</span><span class="details-value">${params.studentEmail}</span></div><div class="details-row"><span class="details-label">Course:</span><span class="details-value">${params.courseName}</span></div><div class="details-row"><span class="details-label">Payment Method:</span><span class="details-value">${params.paymentMethod}</span></div><div class="details-row"><span class="details-label">Payment ID:</span><span class="details-value">${params.paymentId}</span></div><div class="details-row"><span class="details-label">Order ID:</span><span class="details-value">${params.orderId}</span></div><div class="details-row"><span class="details-label">Application ID:</span><span class="details-value">${params.applicationId}</span></div><div class="details-row"><span class="details-label">Payment Date:</span><span class="details-value">${formatEmailDate(params.paymentDate)}</span></div></div><div class="action-box"><strong>⚠️ Action Required:</strong><br>Please verify the payment details and update the student's course access accordingly.</div><p style="text-align:center;"><a href="https://neramclasses.com/applications/${params.applicationId}" class="btn">View Application</a><a href="https://neramclasses.com/applications" class="btn">All Applications</a></p></div><div class="footer"><p>This is an automated admin notification from neramClasses.com</p><p>© 2025 neramClasses.com. All rights reserved.</p></div></div></body></html>`;

    const { AZ_SENDER_USER } = process.env;
    if (!AZ_SENDER_USER) {
      throw new Error('AZ_SENDER_USER not configured');
    }

    const endpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(AZ_SENDER_USER)}/sendMail`;

    const toRecipients = emailList.map(email => ({ emailAddress: { address: email } }));

    const payload = {
      message: {
        subject,
        body: { contentType: 'HTML', content: htmlBody },
        toRecipients,
        importance: 'high',
      },
      saveToSentItems: true,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${graphToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send admin email: ${response.status} ${errorText}`);
    }

    console.log(`[Admin Email] ✅ Admin notification sent to ${emailList.length} recipient(s): ${emailList.join(', ')}`);
  } catch (error) {
    console.error('[Admin Email] ❌ Failed to send admin notification:', error);
    if (error instanceof Error) {
      console.error('[Admin Email] Error details:', error.message);
    }
  }
}
