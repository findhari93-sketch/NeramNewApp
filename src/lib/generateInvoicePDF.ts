import type PDFKit from 'pdfkit';
// dynamic import to avoid ESM/CJS issues in Next.js build
const loadPDFKit = async (): Promise<typeof PDFKit> => (await import('pdfkit')).default as unknown as typeof PDFKit;

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
  const PDFDocument = await loadPDFKit();
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).fillColor('#4a148c').text('neramClasses.com', 50, 50);
      doc.fontSize(10).fillColor('#666')
        .text('Excellence in Education', 50, 80)
        .text('Chennai, Tamil Nadu, India', 50, 95)
        .text('Email: support@neram.co.in', 50, 110)
        .text('Phone: +91 91761 37043', 50, 125);

      doc.fontSize(20).fillColor('#000').text('PAYMENT INVOICE', 350, 50, { align: 'right' });
      doc.fontSize(10).fillColor('#666')
        .text(`Invoice #: ${data.invoiceNumber}`, 350, 80, { align: 'right' })
        .text(`Date: ${formatDate(data.invoiceDate)}`, 350, 95, { align: 'right' })
        .text(`Application ID: ${data.applicationId}`, 350, 110, { align: 'right' });

      doc.moveTo(50, 150).lineTo(550, 150).strokeColor('#4a148c').lineWidth(2).stroke();

      doc.fontSize(12).fillColor('#4a148c').text('STUDENT DETAILS', 50, 170);
      doc.fontSize(10).fillColor('#000')
        .text(`Name: ${data.studentName}`, 50, 195)
        .text(`Email: ${data.studentEmail}`, 50, 210);
      if (data.studentPhone) doc.text(`Phone: ${data.studentPhone}`, 50, 225);

      doc.fontSize(12).fillColor('#4a148c').text('COURSE DETAILS', 50, 260);
      doc.fontSize(10).fillColor('#000')
        .text(`Course Name: ${data.courseName}`, 50, 285)
        .text(`Duration: ${data.courseDuration}`, 50, 300);

      doc.fontSize(12).fillColor('#4a148c').text('PAYMENT DETAILS', 50, 335);
      doc.fontSize(10).fillColor('#000')
        .text(`Payment ID: ${data.paymentId}`, 50, 360)
        .text(`Order ID: ${data.orderId}`, 50, 375)
        .text(`Payment Method: ${data.paymentMethod}`, 50, 390)
        .text(`Payment Date: ${formatDate(data.paymentDate)}`, 50, 405)
        .text(`Payment Type: ${data.paymentType}`, 50, 420);

      doc.fontSize(12).fillColor('#4a148c').text('FEES BREAKDOWN', 50, 455);
      const tableTop = 480; const itemX = 50; const amountX = 450;
      doc.fontSize(10).fillColor('#fff').rect(50, tableTop, 500, 25).fill('#7b1fa2');
      doc.fillColor('#fff').text('Description', itemX + 10, tableTop + 8).text('Amount (₹)', amountX, tableTop + 8);
      let y = tableTop + 35;
      doc.fillColor('#000').text('Total Course Fees', itemX + 10, y).text(formatCurrency(data.totalCourseFees), amountX, y);
      y += 25;
      if (data.discount > 0) { doc.fillColor('#4caf50').text('Discount Applied', itemX + 10, y).text(`- ${formatCurrency(data.discount)}`, amountX, y); y += 25; }
      doc.moveTo(50, y).lineTo(550, y).strokeColor('#ddd').lineWidth(1).stroke(); y += 15;
      doc.fontSize(12).fillColor('#4a148c').text('Amount Paid', itemX + 10, y).text(formatCurrency(data.amountPaid), amountX, y);
      y += 40;
      doc.rect(50, y, 100, 30).fill('#4caf50');
      doc.fontSize(12).fillColor('#fff').text('PAID', 70, y + 8);

      const footerY = 700;
      doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor('#ddd').lineWidth(1).stroke();
      doc.fontSize(9).fillColor('#666')
        .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 15, { align: 'center', width: 500 })
        .text('For queries, contact us at support@neram.co.in or call +91 91761 37043', 50, footerY + 30, { align: 'center', width: 500 })
        .text('© 2025 neramClasses.com. All rights reserved.', 50, footerY + 45, { align: 'center', width: 500 });

      doc.end();
    } catch (err) { reject(err as Error); }
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}
function formatDate(isoDate: string): string {
  try { const date = new Date(isoDate); return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return isoDate; }
}
export function generateInvoiceNumber(applicationId: string): string {
  const d = new Date(); const year = d.getFullYear().toString().slice(-2); const month = (d.getMonth() + 1).toString().padStart(2, '0'); const shortId = applicationId.slice(0, 8).toUpperCase();
  return `INV${year}${month}${shortId}`;
}
