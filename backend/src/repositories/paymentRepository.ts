import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  receiptUrl?: string;
  notes?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

class PaymentRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): Payment[] {
    const stmt = this.db.prepare('SELECT * FROM payments WHERE isActive = 1 ORDER BY paymentDate DESC');
    return stmt.all() as Payment[];
  }

  findById(id: number): Payment | undefined {
    const stmt = this.db.prepare('SELECT * FROM payments WHERE id = ? AND isActive = 1');
    return stmt.get(id) as Payment | undefined;
  }

  findByInvoiceId(invoiceId: number): Payment[] {
    const stmt = this.db.prepare('SELECT * FROM payments WHERE invoiceId = ? AND isActive = 1 ORDER BY paymentDate DESC');
    return stmt.all(invoiceId) as Payment[];
  }

  create(data: {
    invoiceId: number;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    paymentDate?: string;
    receiptUrl?: string;
    notes?: string;
  }): Payment {
    const stmt = this.db.prepare(`
      INSERT INTO payments (invoiceId, amount, paymentMethod, transactionId, paymentDate, receiptUrl, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      data.invoiceId,
      data.amount,
      data.paymentMethod,
      data.transactionId || null,
      data.paymentDate || new Date().toISOString(),
      data.receiptUrl || null,
      data.notes || null
    );

    return this.findById(info.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Payment>): Payment | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'isActive') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE payments 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE payments SET isActive = 0 WHERE id = ?');
    stmt.run(id);
  }

  getTotalReceived(): number {
    const stmt = this.db.prepare('SELECT SUM(amount) as total FROM payments WHERE isActive = 1');
    const result = stmt.get() as { total: number | null };
    return result.total || 0;
  }

  getByPaymentMethod(method: string): Payment[] {
    const stmt = this.db.prepare('SELECT * FROM payments WHERE paymentMethod = ? AND isActive = 1');
    return stmt.all(method) as Payment[];
  }

  getRevenueByDateRange(startDate: string, endDate: string): number {
    const stmt = this.db.prepare(`
      SELECT SUM(amount) as total 
      FROM payments 
      WHERE paymentDate BETWEEN ? AND ? AND isActive = 1
    `);
    const result = stmt.get(startDate, endDate) as { total: number | null };
    return result.total || 0;
  }
}

export default new PaymentRepository();
