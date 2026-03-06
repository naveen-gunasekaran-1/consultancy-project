import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Order {
  id: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber?: string;
  guideId: number;
  productName: string;
  quantity: number;
  dispatchDate: string;
  amount: number;
  amountReceived: number;
  balanceAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  notes?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

class OrderRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): Order[] {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE isActive = 1 ORDER BY dispatchDate DESC');
    return stmt.all() as Order[];
  }

  findById(id: number): Order | undefined {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ? AND isActive = 1');
    return stmt.get(id) as Order | undefined;
  }

  findByGuideId(guideId: number): Order[] {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE guideId = ? AND isActive = 1 ORDER BY dispatchDate DESC');
    return stmt.all(guideId) as Order[];
  }

  findByPaymentStatus(status: string): Order[] {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE paymentStatus = ? AND isActive = 1 ORDER BY dispatchDate DESC');
    return stmt.all(status) as Order[];
  }

  create(data: {
    driverName: string;
    driverPhone: string;
    vehicleNumber?: string;
    guideId: number;
    productName: string;
    quantity: number;
    dispatchDate?: string;
    amount: number;
    amountReceived?: number;
    balanceAmount: number;
    paymentStatus?: 'pending' | 'partial' | 'paid';
    paymentMethod?: string;
    notes?: string;
  }): Order {
    const stmt = this.db.prepare(`
      INSERT INTO orders (driverName, driverPhone, vehicleNumber, guideId, productName, quantity, dispatchDate, amount, amountReceived, balanceAmount, paymentStatus, paymentMethod, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      data.driverName,
      data.driverPhone,
      data.vehicleNumber || null,
      data.guideId,
      data.productName,
      data.quantity,
      data.dispatchDate || new Date().toISOString(),
      data.amount,
      data.amountReceived || 0,
      data.balanceAmount,
      data.paymentStatus || 'pending',
      data.paymentMethod || null,
      data.notes || null
    );

    return this.findById(info.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Order>): Order | undefined {
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
      UPDATE orders 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE orders SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }

  getPendingOrders(): Order[] {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE paymentStatus != ? AND isActive = 1 ORDER BY dispatchDate DESC');
    return stmt.all('paid') as Order[];
  }

  getTotalPendingBalance(): number {
    const stmt = this.db.prepare('SELECT COALESCE(SUM(balanceAmount), 0) as total FROM orders WHERE paymentStatus != ? AND isActive = 1');
    const result = stmt.get('paid') as { total: number } | undefined;
    return result?.total || 0;
  }
}

export default new OrderRepository();
