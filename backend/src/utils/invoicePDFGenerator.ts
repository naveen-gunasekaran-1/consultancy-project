import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { invoiceConfig } from '../config/invoiceConfig';

// Type definition for PDFDocument
type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface InvoiceItem {
  guideName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePDFData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZipCode: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxPercentage: number;
  total: number;
  notes?: string;
}

export class InvoicePDFGenerator {
  static generate(data: InvoicePDFData): Readable {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Header - Shop Info
    this.addHeader(doc, data);

    // Invoice Title and Details
    this.addInvoiceTitle(doc, data);

    // Client and Invoice Info
    this.addClientInfo(doc, data);

    // Items Table
    this.addItemsTable(doc, data);

    // Totals
    this.addTotals(doc, data);

    // Bank Details and Footer
    this.addFooter(doc, data);

    doc.end();
    return doc as unknown as Readable;
  }

  private static addHeader(doc: PDFDocumentType, data: InvoicePDFData): void {
    // Shop Name
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(invoiceConfig.shopName, 50, 40);

    // Shop Details
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`${invoiceConfig.shopAddress}, ${invoiceConfig.shopCity}`, 50, 65)
      .text(`${invoiceConfig.shopState} - ${invoiceConfig.shopPostalCode}`, 50, 80)
      .text(`Phone: ${invoiceConfig.shopPhone} | Email: ${invoiceConfig.shopEmail}`, 50, 95)
      .text(`GSTIN: ${invoiceConfig.shopGSTIN}`, 50, 110);

    // Horizontal line
    doc.moveTo(50, 125).lineTo(550, 125).stroke();
  }

  private static addInvoiceTitle(doc: PDFDocumentType, data: InvoicePDFData): void {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 145);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice #: ${data.invoiceNumber}`, 400, 145)
      .text(`Date: ${data.invoiceDate.toLocaleDateString('en-IN')}`, 400, 160)
      .text(`Due: ${data.dueDate.toLocaleDateString('en-IN')}`, 400, 175);
  }

  private static addClientInfo(doc: PDFDocumentType, data: InvoicePDFData): void {
    doc.fontSize(10).font('Helvetica-Bold').text('BILL TO:', 50, 220);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(data.clientName, 50, 240)
      .text(data.clientAddress, 50, 255)
      .text(`${data.clientCity}, ${data.clientState} - ${data.clientZipCode}`, 50, 270)
      .text(`Email: ${data.clientEmail}`, 50, 285)
      .text(`Phone: ${data.clientPhone}`, 50, 300);
  }

  private static addItemsTable(doc: PDFDocumentType, data: InvoicePDFData): void {
    const startY = 330;
    const tableTop = startY;
    const col1X = 50;
    const col2X = 280;
    const col3X = 380;
    const col4X = 470;

    // Table Header
    doc.fontSize(10).font('Helvetica-Bold');
    doc
      .rect(50, tableTop, 500, 20)
      .fillAndStroke('#f0f0f0', '#000000');

    doc.fillColor('#000000');
    doc.text('Item', col1X + 5, tableTop + 5);
    doc.text('Qty', col2X + 5, tableTop + 5);
    doc.text('Unit Price', col3X + 5, tableTop + 5);
    doc.text('Amount', col4X + 5, tableTop + 5);

    // Table Rows
    let yPosition = tableTop + 25;
    doc.fontSize(9).font('Helvetica');

    data.items.forEach((item) => {
      doc.text(item.guideName, col1X + 5, yPosition, { width: 220, ellipsis: true });
      doc.text(item.quantity.toString(), col2X + 5, yPosition);
      doc.text(`₹${item.unitPrice.toFixed(2)}`, col3X + 5, yPosition);
      doc.text(`₹${item.total.toFixed(2)}`, col4X + 5, yPosition);

      yPosition += 20;
    });

    // Table Border
    doc.rect(50, tableTop, 500, yPosition - tableTop).stroke();
  }

  private static addTotals(doc: PDFDocumentType, data: InvoicePDFData): void {
    const totalsX = 350;
    const totalsStartY = 530;
    const lineHeight = 20;

    doc.fontSize(10).font('Helvetica');

    doc.text('Subtotal:', totalsX, totalsStartY);
    doc.text(`₹${data.subtotal.toFixed(2)}`, totalsX + 150, totalsStartY, { align: 'right' });

    doc.text(`Tax (${data.taxPercentage}%):`, totalsX, totalsStartY + lineHeight);
    doc.text(`₹${data.tax.toFixed(2)}`, totalsX + 150, totalsStartY + lineHeight, { align: 'right' });

    // Total in bold
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('TOTAL:', totalsX, totalsStartY + lineHeight * 2);
    doc.text(`₹${data.total.toFixed(2)}`, totalsX + 150, totalsStartY + lineHeight * 2, {
      align: 'right',
    });

    // Notes if provided
    if (data.notes) {
      doc
        .fontSize(9)
        .font('Helvetica')
        .text('Notes:', 50, totalsStartY + lineHeight * 4);
      doc.text(data.notes, 50, totalsStartY + lineHeight * 4 + 15, { width: 500, align: 'left' });
    }
  }

  private static addFooter(doc: PDFDocumentType, data: InvoicePDFData): void {
    const footerY = 720;

    doc.fontSize(9).font('Helvetica-Bold').text('BANK DETAILS:', 50, footerY - 30);

    doc
      .fontSize(9)
      .font('Helvetica')
      .text(`Bank: ${invoiceConfig.bankName}`, 50, footerY - 15)
      .text(`Account: ${invoiceConfig.bankAccount}`, 50, footerY)
      .text(`IFSC: ${invoiceConfig.bankIFSC}`, 50, footerY + 15);

    // Footer line and copyright
    doc.moveTo(50, footerY + 30).lineTo(550, footerY + 30).stroke();

    doc
      .fontSize(8)
      .text('Thank you for your business! | Generated on ' + new Date().toLocaleDateString('en-IN'), 50, footerY + 40, {
        align: 'center',
      });
  }
}
