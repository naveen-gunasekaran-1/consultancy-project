import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: string;
  commissionRate: number;
  totalEarnings: number;
  performanceScore: number;
  joinDate: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

class WorkerRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): Worker[] {
    const stmt = this.db.prepare('SELECT * FROM workers WHERE isActive = 1 ORDER BY name ASC');
    return stmt.all() as Worker[];
  }

  findById(id: number): Worker | undefined {
    const stmt = this.db.prepare('SELECT * FROM workers WHERE id = ? AND isActive = 1');
    return stmt.get(id) as Worker | undefined;
  }

  findByEmail(email: string): Worker | undefined {
    const stmt = this.db.prepare('SELECT * FROM workers WHERE email = ? AND isActive = 1');
    return stmt.get(email) as Worker | undefined;
  }

  create(data: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    role: string;
    commissionRate?: number;
    totalEarnings?: number;
    performanceScore?: number;
    joinDate?: string;
  }): Worker {
    const stmt = this.db.prepare(`
      INSERT INTO workers (name, email, phone, address, role, commissionRate, totalEarnings, performanceScore, joinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      data.name,
      data.email,
      data.phone,
      data.address || null,
      data.role,
      data.commissionRate || 0,
      data.totalEarnings || 0,
      data.performanceScore || 0,
      data.joinDate || new Date().toISOString()
    );

    return this.findById(info.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Worker>): Worker | undefined {
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
      UPDATE workers 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE workers SET isActive = 0 WHERE id = ?');
    stmt.run(id);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM workers WHERE isActive = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  addEarnings(id: number, amount: number): Worker | undefined {
    const stmt = this.db.prepare(`
      UPDATE workers
      SET totalEarnings = totalEarnings + ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = 1
    `);
    stmt.run(amount, id);
    return this.findById(id);
  }

  getTotalEarnings(): number {
    const stmt = this.db.prepare('SELECT SUM(totalEarnings) as total FROM workers WHERE isActive = 1');
    const result = stmt.get() as { total: number | null };
    return result.total || 0;
  }
}

export default new WorkerRepository();
