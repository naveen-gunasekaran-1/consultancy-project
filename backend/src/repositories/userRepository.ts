import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  role: string;
  tokenVersion: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

class UserRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findByEmail(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1');
    return stmt.get(email) as User | undefined;
  }

  findById(id: number): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ? AND isActive = 1');
    return stmt.get(id) as User | undefined;
  }

  create(userData: { email: string; password: string; name?: string; role?: string }): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (email, password, name, role, tokenVersion)
      VALUES (?, ?, ?, ?, 0)
    `);
    
    const info = stmt.run(
      userData.email,
      userData.password,
      userData.name || null,
      userData.role || 'admin'
    );
    
    return this.findById(info.lastInsertRowid as number)!;
  }

  incrementTokenVersion(userId: number): void {
    const stmt = this.db.prepare('UPDATE users SET tokenVersion = tokenVersion + 1 WHERE id = ?');
    stmt.run(userId);
  }

  update(id: number, data: Partial<User>): User | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(id);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE isActive = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export default new UserRepository();
