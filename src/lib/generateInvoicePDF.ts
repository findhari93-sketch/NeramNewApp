import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  applicationId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseName: string;
  courseDuration: string;
  paymentId: string;
  orderId: string;
  paymentMethod: string;
  paymentDate: string;
  totalCourseFees: number;
  discount: number;
  amountPaid: number;
  paymentType: string;
  gstNumber?: string;
  panNumber?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const purple = rgb(0.29, 0.08, 0.55); // #4a148c
  const gray = rgb(0.4, 0.4, 0.4);
  const black = rgb(0, 0, 0);
  const green = rgb(0.3, 0.69, 0.31); // #4caf50

  let y = 790;

  // Header
  page.drawText("neramClasses.com", {
    x: 50,
    y,
    size: 24,
    font: boldFont,
    color: purple,
  });
  y -= 20;
  page.drawText("Excellence in Education", {
    x: 50,
    y,
    size: 10,
    font,
    color: gray,
  });
  y -= 15;
  page.drawText("Chennai, Tamil Nadu, India", {
    x: 50,
    y,
    size: 10,
    font,
    color: gray,
  });
  y -= 15;
  page.drawText("Email: support@neram.co.in | Phone: +91 91761 37043", {
    x: 50,
    y,
    size: 10,
    font,
    color: gray,
  });

  // Invoice title (right side)
  page.drawText("PAYMENT INVOICE", {
    x: 400,
    y: 790,
    size: 20,
    font: boldFont,
    color: black,
  });
  page.drawText(`Invoice #: ${data.invoiceNumber}`, {
    x: 400,
    y: 770,
    size: 10,
    font,
    color: gray,
  });
  page.drawText(`Date: ${formatDate(data.invoiceDate)}`, {
    x: 400,
    y: 755,
    size: 10,
    font,
    color: gray,
  });
  page.drawText(`Application: ${data.applicationId.slice(0, 8)}`, {
    x: 400,
    y: 740,
    size: 10,
    font,
    color: gray,
  });

  y = 700;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 2,
    color: purple,
  });

  // Student details
  y -= 30;
  page.drawText("STUDENT DETAILS", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: purple,
  });
  y -= 25;
  page.drawText(`Name: ${data.studentName}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  y -= 15;
  page.drawText(`Email: ${data.studentEmail}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  if (data.studentPhone) {
    y -= 15;
    page.drawText(`Phone: ${data.studentPhone}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: black,
    });
  }

  // Course details
  y -= 35;
  page.drawText("COURSE DETAILS", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: purple,
  });
  y -= 25;
  page.drawText(`Course Name: ${data.courseName}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  y -= 15;
  page.drawText(`Duration: ${data.courseDuration}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });

  // Payment details
  y -= 35;
  page.drawText("PAYMENT DETAILS", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: purple,
  });
  y -= 25;
  page.drawText(`Payment ID: ${data.paymentId}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  y -= 15;
  page.drawText(`Order ID: ${data.orderId}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  y -= 15;
  page.drawText(`Payment Method: ${data.paymentMethod}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  y -= 15;
  page.drawText(`Payment Date: ${formatDate(data.paymentDate)}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });
  y -= 15;
  page.drawText(`Payment Type: ${data.paymentType}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: black,
  });

  // Fees breakdown
  y -= 35;
  page.drawText("FEES BREAKDOWN", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: purple,
  });
  y -= 25;

  // Table header
  page.drawRectangle({
    x: 50,
    y: y - 15,
    width: 495,
    height: 25,
    color: rgb(0.48, 0.12, 0.63),
  });
  page.drawText("Description", {
    x: 60,
    y: y - 7,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  page.drawText("Amount (₹)", {
    x: 450,
    y: y - 7,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  y -= 45;
  page.drawText("Total Course Fees", {
    x: 60,
    y,
    size: 10,
    font,
    color: black,
  });
  page.drawText(formatCurrency(data.totalCourseFees), {
    x: 450,
    y,
    size: 10,
    font,
    color: black,
  });

  if (data.discount > 0) {
    y -= 20;
    page.drawText("Discount Applied", {
      x: 60,
      y,
      size: 10,
      font,
      color: green,
    });
    page.drawText(`- ${formatCurrency(data.discount)}`, {
      x: 450,
      y,
      size: 10,
      font,
      color: green,
    });
  }

  y -= 25;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: gray,
  });

  y -= 20;
  page.drawText("Amount Paid", {
    x: 60,
    y,
    size: 12,
    font: boldFont,
    color: purple,
  });
  page.drawText(formatCurrency(data.amountPaid), {
    x: 450,
    y,
    size: 12,
    font: boldFont,
    color: purple,
  });

  y -= 30;
  page.drawRectangle({
    x: 50,
    y: y - 15,
    width: 100,
    height: 30,
    color: green,
  });
  page.drawText("PAID", {
    x: 75,
    y: y - 5,
    size: 12,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Footer
  const footerY = 100;
  page.drawLine({
    start: { x: 50, y: footerY },
    end: { x: 545, y: footerY },
    thickness: 1,
    color: gray,
  });
  page.drawText(
    "This is a computer-generated invoice and does not require a signature.",
    {
      x: 50,
      y: footerY - 15,
      size: 9,
      font,
      color: gray,
      maxWidth: 495,
    }
  );
  page.drawText(
    "For queries, contact us at support@neram.co.in or call +91 91761 37043",
    {
      x: 50,
      y: footerY - 30,
      size: 9,
      font,
      color: gray,
      maxWidth: 495,
    }
  );
  page.drawText("© 2025 neramClasses.com. All rights reserved.", {
    x: 50,
    y: footerY - 45,
    size: 9,
    font,
    color: gray,
    maxWidth: 495,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export function generateInvoiceNumber(applicationId: string): string {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const shortId = applicationId.slice(0, 8).toUpperCase();
  return `INV${year}${month}${shortId}`;
}
