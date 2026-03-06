import { getDatabase } from '../config/database';
import Database from 'better-sqlite3';

export interface Inventory {
  id: number;
  guideId: number;
  warehouseLocation?: string | null;
  stockQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestocked?: string | null;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  notes?: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryWithGuide extends Inventory {
  guideName: string;
  guidePrice: number;
  guideCategory?: string | null;
}

class InventoryRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): InventoryWithGuide[] {
    const stmt = this.db.prepare(`
      SELECT 
        i.*,
        g.name as guideName,
        g.price as guidePrice,
        g.category as guideCategory
      FROM inventory i
      LEFT JOIN guides g ON i.guideId = g.id
      WHERE i.isActive = 1
      ORDER BY i.updatedAt DESC
    `);
    return stmt.all() as InventoryWithGuide[];
  }

  findById(id: number): InventoryWithGuide | undefined {
    const stmt = this.db.prepare(`
      SELECT 
        i.*,
        g.name as guideName,
        g.price as guidePrice,
        g.category as guideCategory
      FROM inventory i
      LEFT JOIN guides g ON i.guideId = g.id
      WHERE i.id = ? AND i.isActive = 1
    `);
    return stmt.get(id) as InventoryWithGuide | undefined;
  }

  findByGuideId(guideId: number): InventoryWithGuide | undefined {
    const stmt = this.db.prepare(`
      SELECT 
        i.*,
        g.name as guideName,
        g.price as guidePrice,
        g.category as guideCategory
      FROM inventory i
      LEFT JOIN guides g ON i.guideId = g.id
      WHERE i.guideId = ? AND i.isActive = 1
    `);
    return stmt.get(guideId) as InventoryWithGuide | undefined;
  }

  create(data: {
    guideId: number;
    warehouseLocation?: string;
    stockQuantity: number;
    reorderLevel: number;
    reorderQuantity: number;
    status?: string;
    notes?: string;
  }): Inventory {
    const stmt = this.db.prepare(`
      INSERT INTO inventory (
        guideId, warehouseLocation, stockQuantity, reorderLevel, 
        reorderQuantity, status, notes, lastRestocked
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const info = stmt.run(
      data.guideId,
      data.warehouseLocation || null,
      data.stockQuantity,
      data.reorderLevel,
      data.reorderQuantity,
      data.status || 'in-stock',
      data.notes || null
    );

    return this.findById(info.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Inventory>): Inventory | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'guideId' && key !== 'createdAt' && key !== 'isActive') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE inventory 
      SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  adjustStock(id: number, adjustment: number, reason?: string): Inventory | undefined {
    const inventory = this.findById(id);
    if (!inventory) {
      return undefined;
    }

    const newQuantity = inventory.stockQuantity + adjustment;
    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    // Determine new status based on stock levels
    let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued' = 'in-stock';
    if (newQuantity === 0) {
      newStatus = 'out-of-stock';
    } else if (newQuantity <= inventory.reorderLevel) {
      newStatus = 'low-stock';
    }

    // Append reason to notes if provided
    let newNotes = inventory.notes || '';
    if (reason) {
      const timestamp = new Date().toISOString();
      const adjustmentNote = `\n[${timestamp}] Adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}. Reason: ${reason}`;
      newNotes += adjustmentNote;
    }

    const stmt = this.db.prepare(`
      UPDATE inventory 
      SET 
        stockQuantity = ?,
        status = ?,
        lastRestocked = CASE WHEN ? > 0 THEN CURRENT_TIMESTAMP ELSE lastRestocked END,
        notes = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(newQuantity, newStatus, adjustment, newNotes, id);
    return this.findById(id);
  }

  findLowStock(): InventoryWithGuide[] {
    const stmt = this.db.prepare(`
      SELECT 
        i.*,
        g.name as guideName,
        g.price as guidePrice,
        g.category as guideCategory
      FROM inventory i
      LEFT JOIN guides g ON i.guideId = g.id
      WHERE i.status = 'low-stock' AND i.isActive = 1
      ORDER BY i.stockQuantity ASC
    `);
    return stmt.all() as InventoryWithGuide[];
  }

  delete(id: number): void {
    const stmt = this.db.prepare('UPDATE inventory SET isActive = 0 WHERE id = ?');
    stmt.run(id);
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM inventory WHERE isActive = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export default new InventoryRepository();
