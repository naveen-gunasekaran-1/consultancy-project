import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyName?: string;
  notes?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

class ClientRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): Client[] {
    const stmt = this.db.prepare('SELECT * FROM clients WHERE isActive = 1 ORDER BY createdAt DESC');
    return stmt.all() as Client[];
  }

  findById(id: number): Client | undefined {
    const stmt = this.db.prepare('SELECT * FROM clients WHERE id = ? AND isActive = 1');
    return stmt.get(id) as Client |undefined;
  }

  findByEmail(email: string): Client | undefined {
    const stmt = this.db.prepare('SELECT * FROM clients WHERE email = ? AND isActive = 1');
    return stmt.get(email) as Client | undefined;
  }

  create(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    companyName?: string;
    notes?: string;
  }): Client {
    const stmt = this.db.prepare(`
      INSERT INTO clients (name, email, phone, address, city, state, zipCode, country, companyName, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      data.name,
      data.email,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.zipCode || null,
      data.country || 'India',
      data.companyName || null,
      data.notes || null
    );

    return this.findById(info.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Client>): Client | undefined {
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
      UPDATE clients 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE clients SET isActive = 0 WHERE id = ?');
    stmt.run(id);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM clients WHERE isActive = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export default new ClientRepository();
