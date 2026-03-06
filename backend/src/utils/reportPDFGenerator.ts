import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { invoiceConfig } from '../config/invoiceConfig';

type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface FinancialReportData {
  reportType: 'financial';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalTax: number;
  totalPayments: number;
  invoiceStats: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

interface WorkerPerformanceData {
  reportType: 'worker';
  startDate: Date;
  endDate: Date;
  topPerformers: Array<{
    name: string;
    totalSales: number;
    invoiceCount: number;
    performanceScore: number;
  }>;
  summary: {
    totalWorkers: number;
    totalSales: number;
    avgPerformance: number;
  };
}

type ReportData = FinancialReportData | WorkerPerformanceData;

export class ReportPDFGenerator {
  static generate(data: ReportData): Readable {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    this.addHeader(doc, data);
    this.addReportTitle(doc, data);

    if (data.reportType === 'financial') {
      this.addFinancialReport(doc, data as FinancialReportData);
    } else {
      this.addWorkerReport(doc, data as WorkerPerformanceData);
    }

    this.addFooter(doc);

    doc.end();
    return doc as unknown as Readable;
  }

  private static addHeader(doc: PDFDocumentType, data: ReportData): void {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#6366F1')
      .text(invoiceConfig.shopName, 50, 40);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(`${invoiceConfig.shopAddress}, ${invoiceConfig.shopCity}`, 50, 70)
      .text(`${invoiceConfig.shopState} - ${invoiceConfig.shopPostalCode}`, 50, 85);

    doc
      .moveTo(50, 105)
      .lineTo(550, 105)
      .strokeColor('#6366F1')
      .lineWidth(2)
      .stroke();
  }

  private static addReportTitle(doc: PDFDocumentType, data: ReportData): void {
    const title = data.reportType === 'financial' ? 'FINANCIAL REPORT' : 'WORKER PERFORMANCE REPORT';

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(title, 50, 125);

    // Date range
    const dateRange = `${data.startDate.toLocaleDateString('en-IN')} - ${data.endDate.toLocaleDateString('en-IN')}`;
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Report Period: ${dateRange}`, 50, 150);

    doc
      .fontSize(8)
      .fillColor('#9CA3AF')
      .text(`Generated: ${new Date().toLocaleString('en-IN')}`, 400, 150);
  }

  private static addFinancialReport(doc: PDFDocumentType, data: FinancialReportData): void {
    let yPos = 190;

    // Revenue Summary Cards
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('REVENUE SUMMARY', 50, yPos);

    yPos += 30;

    // Total Revenue Card
    doc
      .rect(50, yPos, 160, 70)
      .fillColor('#EFF6FF')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Total Revenue', 60, yPos + 15);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#3B82F6')
      .text(`₹${data.totalRevenue.toLocaleString('en-IN')}`, 60, yPos + 35);

    // Tax Collected Card
    doc
      .rect(220, yPos, 160, 70)
      .fillColor('#F0FDF4')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Tax Collected', 230, yPos + 15);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#10B981')
      .text(`₹${data.totalTax.toLocaleString('en-IN')}`, 230, yPos + 35);

    // Payments Received Card
    doc
      .rect(390, yPos, 160, 70)
      .fillColor('#FEF3C7')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Payments Received', 400, yPos + 15);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#F59E0B')
      .text(`₹${data.totalPayments.toLocaleString('en-IN')}`, 400, yPos + 35);

    yPos += 100;

    // Invoice Statistics
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('INVOICE STATISTICS', 50, yPos);

    yPos += 25;

    const stats = [
      { label: 'Total Invoices', value: data.invoiceStats.total, color: '#6B7280' },
      { label: 'Paid', value: data.invoiceStats.paid, color: '#10B981' },
      { label: 'Pending', value: data.invoiceStats.pending, color: '#F59E0B' },
      { label: 'Overdue', value: data.invoiceStats.overdue, color: '#EF4444' }
    ];

    stats.forEach((stat, index) => {
      const xPos = 50 + (index * 125);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(stat.label, xPos, yPos);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(stat.color)
        .text(stat.value.toString(), xPos, yPos + 18);
    });

    yPos += 60;

    // Payment Methods
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('PAYMENT METHODS BREAKDOWN', 50, yPos);

    yPos += 30;

    // Table header
    doc
      .rect(50, yPos, 500, 25)
      .fillColor('#6366F1')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('Payment Method', 60, yPos + 8)
      .text('Amount', 300, yPos + 8, { width: 100, align: 'right' })
      .text('Percentage', 450, yPos + 8, { width: 80, align: 'right' });

    yPos += 30;

    // Table rows
    data.paymentMethods.forEach((method) => {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#111827')
        .text(method.method, 60, yPos)
        .text(`₹${method.amount.toLocaleString('en-IN')}`, 300, yPos, { width: 100, align: 'right' })
        .font('Helvetica-Bold')
        .fillColor('#6366F1')
        .text(`${method.percentage.toFixed(1)}%`, 450, yPos, { width: 80, align: 'right' });

      doc
        .moveTo(50, yPos + 20)
        .lineTo(550, yPos + 20)
        .strokeColor('#E5E7EB')
        .lineWidth(0.5)
        .stroke();

      yPos += 25;
    });
  }

  private static addWorkerReport(doc: PDFDocumentType, data: WorkerPerformanceData): void {
    let yPos = 190;

    // Summary Cards
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('SUMMARY', 50, yPos);

    yPos += 30;

    // Total Workers Card
    doc
      .rect(50, yPos, 160, 70)
      .fillColor('#F3F4F6')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Total Workers', 60, yPos + 15);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(data.summary.totalWorkers.toString(), 60, yPos + 35);

    // Total Sales Card
    doc
      .rect(220, yPos, 160, 70)
      .fillColor('#DBEAFE')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Total Sales', 230, yPos + 15);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#3B82F6')
      .text(`₹${data.summary.totalSales.toLocaleString('en-IN')}`, 230, yPos + 35);

    // Avg Performance Card
    doc
      .rect(390, yPos, 160, 70)
      .fillColor('#D1FAE5')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Avg Performance', 400, yPos + 15);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#10B981')
      .text(data.summary.avgPerformance.toFixed(1), 400, yPos + 35);

    yPos += 100;

    // Top Performers Table
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('TOP PERFORMERS', 50, yPos);

    yPos += 30;

    // Table header
    doc
      .rect(50, yPos, 500, 25)
      .fillColor('#6366F1')
      .fill();

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('Worker Name', 60, yPos + 8)
      .text('Total Sales', 250, yPos + 8, { width: 100, align: 'right' })
      .text('Invoices', 360, yPos + 8, { width: 80, align: 'right' })
      .text('Score', 450, yPos + 8, { width: 80, align: 'right' });

    yPos += 30;

    // Table rows
    data.topPerformers.forEach((worker, index) => {
      const rowColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      
      doc
        .rect(50, yPos - 5, 500, 25)
        .fillColor(rowColor)
        .fill();

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#111827')
        .text(worker.name, 60, yPos)
        .text(`₹${worker.totalSales.toLocaleString('en-IN')}`, 250, yPos, { width: 100, align: 'right' })
        .text(worker.invoiceCount.toString(), 360, yPos, { width: 80, align: 'right' });

      // Performance score with color
      const scoreColor = worker.performanceScore >= 90 ? '#10B981' : 
                        worker.performanceScore >= 70 ? '#F59E0B' : '#EF4444';
      
      doc
        .font('Helvetica-Bold')
        .fillColor(scoreColor)
        .text(worker.performanceScore.toFixed(1), 450, yPos, { width: 80, align: 'right' });

      yPos += 25;
    });
  }

  private static addFooter(doc: PDFDocumentType): void {
    const footerY = 720;

    doc
      .moveTo(50, footerY)
      .lineTo(550, footerY)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#9CA3AF')
      .text('This is a computer-generated report. No signature required.', 50, footerY + 10, {
        align: 'center',
        width: 500
      });

    doc
      .fontSize(7)
      .fillColor('#D1D5DB')
      .text(`${invoiceConfig.shopName} © ${new Date().getFullYear()}`, 50, footerY + 25, {
        align: 'center',
        width: 500
      });
  }
}
