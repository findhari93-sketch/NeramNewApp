import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type InvoiceData = {
  studentName?: string | null;
  email?: string | null;
  course?: string | null;
  orderId: string;
  paymentId: string;
  amount: number; // INR rupees
  currency?: string; // default INR
  issuedAt?: string; // ISO
};

export function renderInvoiceHtml(data: InvoiceData) {
  const d = new Date(data.issuedAt || new Date().toISOString());
  const fmt = d.toLocaleString();
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
    <h2 style="color:#7c1fa0">Neram Classes - Payment Receipt</h2>
    <p>Thank you for your payment.</p>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:6px;border:1px solid #ddd">Student</td><td style="padding:6px;border:1px solid #ddd">${
        data.studentName || "-"
      }</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd">Email</td><td style="padding:6px;border:1px solid #ddd">${
        data.email || "-"
      }</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd">Course</td><td style="padding:6px;border:1px solid #ddd">${
        data.course || "general"
      }</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd">Order ID</td><td style="padding:6px;border:1px solid #ddd">${
        data.orderId
      }</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd">Payment ID</td><td style="padding:6px;border:1px solid #ddd">${
        data.paymentId
      }</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd">Amount</td><td style="padding:6px;border:1px solid #ddd">₹${Number(
        data.amount
      ).toLocaleString("en-IN")} ${data.currency || "INR"}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd">Issued</td><td style="padding:6px;border:1px solid #ddd">${fmt}</td></tr>
    </table>
    <p style="font-size:12px;color:#666">This is a system-generated receipt.</p>
  </div>`;
}

export async function renderInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = 800;
  const title = "Neram Classes - Payment Receipt";
  page.drawText(title, {
    x: 50,
    y,
    size: 18,
    font,
    color: rgb(0.49, 0.12, 0.63),
  });
  y -= 30;
  const lines = [
    `Student: ${data.studentName || "-"}`,
    `Email: ${data.email || "-"}`,
    `Course: ${data.course || "general"}`,
    `Order ID: ${data.orderId}`,
    `Payment ID: ${data.paymentId}`,
    `Amount: Rs. ${Number(data.amount).toLocaleString("en-IN")} ${
      data.currency || "INR"
    }`,
    `Issued: ${new Date(
      data.issuedAt || new Date().toISOString()
    ).toLocaleString()}`,
  ];
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= 18;
  }
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
