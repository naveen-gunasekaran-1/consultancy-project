import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  total: number;
  status: string;
  notes?: string;
  dueDate?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  guideId: number;
  guideName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

class InvoiceRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): InvoiceWithItems[] {
    const stmt = this.db.prepare('SELECT * FROM invoices WHERE isActive = 1 ORDER BY createdAt DESC');
    const invoices = stmt.all() as Invoice[];
    
    return invoices.map(invoice => ({
      ...invoice,
      items: this.getInvoiceItems(invoice.id)
    }));
  }

  findById(id: number): InvoiceWithItems | undefined {
    const stmt = this.db.prepare('SELECT * FROM invoices WHERE id = ? AND isActive = 1');
    const invoice = stmt.get(id) as Invoice | undefined;
    
    if (!invoice) return undefined;
    
    return {
      ...invoice,
      items: this.getInvoiceItems(invoice.id)
    };
  }

  findByInvoiceNumber(invoiceNumber: string): InvoiceWithItems | undefined {
    const stmt = this.db.prepare('SELECT * FROM invoices WHERE invoiceNumber = ? AND isActive = 1');
    const invoice = stmt.get(invoiceNumber) as Invoice | undefined;
    
    if (!invoice) return undefined;
    
    return {
      ...invoice,
      items: this.getInvoiceItems(invoice.id)
    };
  }

  getInvoiceItems(invoiceId: number): InvoiceItem[] {
    const stmt = this.db.prepare('SELECT * FROM invoice_items WHERE invoiceId = ?');
    return stmt.all(invoiceId) as InvoiceItem[];
  }

  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INV/${year}${month}/`;
    
    // Get the last invoice number for this month
    const stmt = this.db.prepare(`
      SELECT invoiceNumber FROM invoices 
      WHERE invoiceNumber LIKE ? 
      ORDER BY invoiceNumber DESC 
      LIMIT 1
    `);
    const last = stmt.get(`${prefix}%`) as { invoiceNumber: string } | undefined;
    
    if (last) {
      const lastNum = parseInt(last.invoiceNumber.split('/')[2]);
      return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
    }
    
    return `${prefix}0001`;
  }

  create(data: {
    clientId: number;
    items: Array<{
      guideId: number;
      guideName: string;
      quantity: number;
      unitPrice: number;
    }>;
    taxPercentage: number;
    notes?: string;
    dueDate?: string;
  }): InvoiceWithItems {
    const invoiceNumber = this.generateInvoiceNumber();
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (subtotal * data.taxPercentage) / 100;
    const total = subtotal + tax;
    
    const insertInvoice = this.db.prepare(`
      INSERT INTO invoices (invoiceNumber, clientId, subtotal, tax, taxPercentage, total, status, notes, dueDate)
      VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `);

    const insertItem = this.db.prepare(`
      INSERT INTO invoice_items (invoiceId, guideId, guideName, quantity, unitPrice, total)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const decrementStock = this.db.prepare('UPDATE guides SET stock = stock - ? WHERE id = ?');

    const createInvoiceTx = this.db.transaction(() => {
      const info = insertInvoice.run(
        invoiceNumber,
        data.clientId,
        subtotal,
        tax,
        data.taxPercentage,
        total,
        data.notes || null,
        data.dueDate || null
      );

      const invoiceId = info.lastInsertRowid as number;

      data.items.forEach((item) => {
        insertItem.run(
          invoiceId,
          item.guideId,
          item.guideName,
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice
        );
        decrementStock.run(item.quantity, item.guideId);
      });

      return invoiceId;
    });

    const createdInvoiceId = createInvoiceTx();
    return this.findById(createdInvoiceId)!;
  }

  updateStatus(id: number, status: string): Invoice | undefined {
    const stmt = this.db.prepare(`
      UPDATE invoices 
      SET status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(status, id);
    return this.findById(id);
  }

  update(id: number, data: Partial<Invoice>): Invoice | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'isActive' && key !== 'invoiceNumber') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE invoices 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE invoices SET isActive = 0 WHERE id = ?');
    stmt.run(id);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM invoices WHERE isActive = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  countByStatus(status: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM invoices WHERE status = ? AND isActive = 1');
    const result = stmt.get(status) as { count: number };
    return result.count;
  }

  findByClientId(clientId: number): InvoiceWithItems[] {
    const stmt = this.db.prepare('SELECT * FROM invoices WHERE clientId = ? AND isActive = 1 ORDER BY createdAt DESC');
    const invoices = stmt.all(clientId) as Invoice[];
    
    return invoices.map(invoice => ({
      ...invoice,
      items: this.getInvoiceItems(invoice.id)
    }));
  }

  getTotalRevenue(): number {
    const stmt = this.db.prepare('SELECT SUM(total) as total FROM invoices WHERE isActive = 1');
    const result = stmt.get() as { total: number | null };
    return result.total || 0;
  }

  getRevenueByDateRange(startDate: string, endDate: string): number {
    const stmt = this.db.prepare(`
      SELECT SUM(total) as total 
      FROM invoices 
      WHERE createdAt BETWEEN ? AND ? AND isActive = 1
    `);
    const result = stmt.get(startDate, endDate) as { total: number | null };
    return result.total || 0;
  }
}

export default new InvoiceRepository();
