import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { invoiceConfig } from '../config/invoiceConfig';

type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface OrderPDFData {
  orderId: number;
  orderDate: Date;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  guideName: string;
  quantity: number;
  price: number;
  total: number;
  paymentStatus: string;
  notes?: string;
}

export class OrderPDFGenerator {
  static generate(data: OrderPDFData): Readable {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    this.addHeader(doc);
    this.addOrderDetails(doc, data);
    this.addDriverInfo(doc, data);
    this.addOrderItems(doc, data);
    this.addPaymentInfo(doc, data);
    this.addFooter(doc);

    doc.end();
    return doc as unknown as Readable;
  }

  private static addHeader(doc: PDFDocumentType): void {
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor('#6366F1')
      .text(invoiceConfig.shopName, 50, 40);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(`${invoiceConfig.shopAddress}, ${invoiceConfig.shopCity}`, 50, 70)
      .text(`${invoiceConfig.shopState} - ${invoiceConfig.shopPostalCode}`, 50, 85)
      .text(`Phone: ${invoiceConfig.shopPhone} | Email: ${invoiceConfig.shopEmail}`, 50, 100);

    doc
      .moveTo(50, 120)
      .lineTo(550, 120)
      .strokeColor('#6366F1')
      .lineWidth(2)
      .stroke();
  }

  private static addOrderDetails(doc: PDFDocumentType, data: OrderPDFData): void {
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('ORDER RECEIPT', 50, 140);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Order ID:', 400, 140)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(`#${data.orderId}`, 460, 140);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Order Date:', 400, 155)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.orderDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 460, 155);
  }

  private static addDriverInfo(doc: PDFDocumentType, data: OrderPDFData): void {
    // Driver Information box
    doc
      .rect(50, 195, 250, 90)
      .fillColor('#F9FAFB')
      .fill();

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('DRIVER INFORMATION', 60, 205);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Name:', 60, 225)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.driverName, 110, 225);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Phone:', 60, 245)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.driverPhone, 110, 245);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Vehicle:', 60, 265)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.vehicleNumber, 110, 265);

    // Vehicle number box (like a license plate)
    doc
      .rect(320, 210, 230, 65)
      .fillColor('#6366F1')
      .fill();

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(data.vehicleNumber, 330, 230, {
        width: 210,
        align: 'center'
      });
  }

  private static addOrderItems(doc: PDFDocumentType, data: OrderPDFData): void {
    const tableTop = 320;

    // Table header
    doc
      .rect(50, tableTop, 500, 30)
      .fillColor('#6366F1')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('ITEM DESCRIPTION', 60, tableTop + 10, { width: 200 })
      .text('QUANTITY', 270, tableTop + 10, { width: 80, align: 'center' })
      .text('UNIT PRICE', 360, tableTop + 10, { width: 90, align: 'right' })
      .text('TOTAL', 460, tableTop + 10, { width: 80, align: 'right' });

    // Table row
    const rowTop = tableTop + 40;
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#111827')
      .text(data.guideName, 60, rowTop, { width: 200 })
      .text(data.quantity.toString(), 270, rowTop, { width: 80, align: 'center' })
      .text(`₹${data.price.toFixed(2)}`, 360, rowTop, { width: 90, align: 'right' })
      .font('Helvetica-Bold')
      .text(`₹${data.total.toFixed(2)}`, 460, rowTop, { width: 80, align: 'right' });

    // Bottom line
    doc
      .moveTo(50, rowTop + 25)
      .lineTo(550, rowTop + 25)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();

    // Total box
    doc
      .rect(350, rowTop + 40, 200, 35)
      .fillColor('#F9FAFB')
      .fill();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('TOTAL AMOUNT:', 360, rowTop + 50)
      .fontSize(14)
      .fillColor('#6366F1')
      .text(`₹${data.total.toFixed(2)}`, 470, rowTop + 48, { align: 'right' });

    // Notes if present
    if (data.notes) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#6B7280')
        .text('Notes:', 60, rowTop + 95);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#374151')
        .text(data.notes, 60, rowTop + 110, { width: 480 });
    }
  }

  private static addPaymentInfo(doc: PDFDocumentType, data: OrderPDFData): void {
    const statusY = 540;

    // Payment status badge
    const statusColors: Record<string, { bg: string; text: string }> = {
      paid: { bg: '#D1FAE5', text: '#047857' },
      pending: { bg: '#FEF3C7', text: '#D97706' },
      failed: { bg: '#FEE2E2', text: '#DC2626' }
    };

    const colors = statusColors[data.paymentStatus.toLowerCase()] || statusColors.pending;

    doc
      .rect(60, statusY, 120, 30)
      .fillColor(colors.bg)
      .fill();

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(colors.text)
      .text(`Payment: ${data.paymentStatus.toUpperCase()}`, 70, statusY + 9);
  }

  private static addFooter(doc: PDFDocumentType): void {
    const footerY = 700;

    doc
      .moveTo(50, footerY)
      .lineTo(550, footerY)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Thank you for your business!', 50, footerY + 15, {
        align: 'center',
        width: 500
      });

    doc
      .fontSize(8)
      .fillColor('#9CA3AF')
      .text(`Generated on ${new Date().toLocaleString('en-IN')}`, 50, footerY + 35, {
        align: 'center',
        width: 500
      });

    // Bank Details (if payment is pending)
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Bank: ${invoiceConfig.bankName} | Account: ${invoiceConfig.bankAccount}`, 50, footerY + 55, {
        align: 'center',
        width: 500,
      });

    doc
      .fontSize(8)
      .fillColor('#6B7280')
      .text(`IFSC: ${invoiceConfig.bankIFSC}`, 50, footerY + 70, {
        align: 'center',
        width: 500
      });
  }
}
