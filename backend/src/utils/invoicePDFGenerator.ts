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
    let yPosition = startY;
    const pageHeight = 750;
    const rowHeight = 25;
    const margin = 50;
    const tableWidth = 500;
    
    // Column positions and widths
    const itemX = margin;
    const itemWidth = 260;
    const qtyX = itemX + itemWidth;
    const qtyWidth = 60;
    const priceX = qtyX + qtyWidth;
    const priceWidth = 100;
    const amountX = priceX + priceWidth;
    const amountWidth = 80;

    // Draw table header with background
    const headerY = yPosition;
    doc.rect(itemX, headerY, tableWidth, rowHeight).fill('#f0f0f0');
    doc.fillColor('#000000');
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', itemX + 5, headerY + 7);
    doc.text('Qty', qtyX + 15, headerY + 7, { width: qtyWidth - 20, align: 'center' });
    doc.text('Price', priceX + 10, headerY + 7, { width: priceWidth - 15, align: 'right' });
    doc.text('Amount', amountX + 5, headerY + 7, { width: amountWidth - 10, align: 'right' });

    // Draw header borders
    doc.moveTo(itemX, headerY).lineTo(itemX + tableWidth, headerY).stroke(); // Top
    doc.moveTo(itemX, headerY + rowHeight).lineTo(itemX + tableWidth, headerY + rowHeight).stroke(); // Bottom
    doc.moveTo(itemX, headerY).lineTo(itemX, headerY + rowHeight).stroke(); // Left
    doc.moveTo(qtyX, headerY).lineTo(qtyX, headerY + rowHeight).stroke(); // Column divider
    doc.moveTo(priceX, headerY).lineTo(priceX, headerY + rowHeight).stroke(); // Column divider
    doc.moveTo(amountX, headerY).lineTo(amountX, headerY + rowHeight).stroke(); // Column divider
    doc.moveTo(amountX + amountWidth, headerY).lineTo(amountX + amountWidth, headerY + rowHeight).stroke(); // Right

    yPosition += rowHeight;

    // Draw table rows
    doc.fontSize(9).font('Helvetica');
    doc.fillColor('#000000');

    data.items.forEach((item) => {
      // Check if we need a page break
      if (yPosition + rowHeight > pageHeight - 100) {
        doc.addPage();
        yPosition = 50;
      }

      // Draw row content
      const rowY = yPosition;
      
      // Item name (with text wrapping)
      doc.text(item.guideName, itemX + 5, rowY + 7, { 
        width: itemWidth - 10, 
        height: rowHeight - 4,
        ellipsis: true 
      });
      
      // Qty (center aligned)
      doc.text(item.quantity.toString(), qtyX + 5, rowY + 7, { 
        width: qtyWidth - 10, 
        align: 'center' 
      });
      
      // Unit Price (right aligned)
      doc.text(`₹${item.unitPrice.toFixed(2)}`, priceX + 5, rowY + 7, { 
        width: priceWidth - 10, 
        align: 'right' 
      });
      
      // Amount (right aligned)
      doc.text(`₹${item.total.toFixed(2)}`, amountX + 5, rowY + 7, { 
        width: amountWidth - 10, 
        align: 'right' 
      });

      // Draw row borders
      doc.moveTo(itemX, rowY).lineTo(itemX + tableWidth, rowY).stroke(); // Top
      doc.moveTo(itemX, rowY + rowHeight).lineTo(itemX + tableWidth, rowY + rowHeight).stroke(); // Bottom
      doc.moveTo(itemX, rowY).lineTo(itemX, rowY + rowHeight).stroke(); // Left
      doc.moveTo(qtyX, rowY).lineTo(qtyX, rowY + rowHeight).stroke(); // Column divider
      doc.moveTo(priceX, rowY).lineTo(priceX, rowY + rowHeight).stroke(); // Column divider
      doc.moveTo(amountX, rowY).lineTo(amountX, rowY + rowHeight).stroke(); // Column divider
      doc.moveTo(amountX + amountWidth, rowY).lineTo(amountX + amountWidth, rowY + rowHeight).stroke(); // Right

      yPosition += rowHeight;
    });

    // Store the final Y position for totals section
    (doc as any)._tableEndY = yPosition;
  }

  private static addTotals(doc: PDFDocumentType, data: InvoicePDFData): void {
    const totalsX = 350;
    const tableEndY = (doc as any)._tableEndY || 530;
    const totalsStartY = tableEndY + 20;
    const lineHeight = 20;

    doc.fontSize(10).font('Helvetica');

    doc.text('Subtotal:', totalsX, totalsStartY);
    doc.text(`₹${data.subtotal.toFixed(2)}`, totalsX + 150, totalsStartY, { align: 'right' });

    doc.text(`Tax (${data.taxPercentage}%):`, totalsX, totalsStartY + lineHeight);
    doc.text(`₹${data.tax.toFixed(2)}`, totalsX + 150, totalsStartY + lineHeight, { align: 'right' });

    // Total in bold and larger
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
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
