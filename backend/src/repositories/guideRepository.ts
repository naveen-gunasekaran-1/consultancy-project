import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Guide {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  category?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

class GuideRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): Guide[] {
    const stmt = this.db.prepare('SELECT * FROM guides WHERE isActive = 1 ORDER BY createdAt DESC');
    return stmt.all() as Guide[];
  }

  findById(id: number): Guide | undefined {
    const stmt = this.db.prepare('SELECT * FROM guides WHERE id = ? AND isActive = 1');
    return stmt.get(id) as Guide | undefined;
  }

  create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    minStock?: number;
    category?: string;
  }): Guide {
    const stmt = this.db.prepare(`
      INSERT INTO guides (name, description, price, stock, minStock, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      data.name,
      data.description || null,
      data.price,
      data.stock || 0,
      data.minStock || 5,
      data.category || null
    );

    return this.findById(info.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Guide>): Guide | undefined {
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
      UPDATE guides 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE guides SET isActive = 0 WHERE id = ?');
    stmt.run(id);
  }

  updateStock(id: number, quantity: number, type: 'add' | 'subtract'): void {
    const operator = type === 'add' ? '+' : '-';
    const stmt = this.db.prepare(`UPDATE guides SET stock = stock ${operator} ? WHERE id = ?`);
    stmt.run(quantity, id);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM guides WHERE isActive = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  getLowStock(): Guide[] {
    const stmt = this.db.prepare('SELECT * FROM guides WHERE stock < minStock AND isActive = 1');
    return stmt.all() as Guide[];
  }
}

export default new GuideRepository();
