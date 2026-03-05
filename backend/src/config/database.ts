import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

let db: Database.Database | null = null;

// Get database path - will be overridden by Electron with userData path
const getDbPath = (): string => {
  // Check if Electron app data path is provided
  const electronDataPath = process.env.SQLITE_DB_PATH;
  
  if (electronDataPath) {
    // Ensure directory exists
    const dir = path.dirname(electronDataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return electronDataPath;
  }
  
  // Fallback to local data directory for development
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'database.db');
};

export const initializeDatabase = (): Database.Database => {
  try {
    const dbPath = getDbPath();
    logger.info('database.initializing', { path: dbPath });
    
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    createTables();
    
    // Create default admin user if not exists
    createDefaultUser();
    
    logger.info('database.initialized', { path: dbPath });
    return db;
  } catch (error) {
    logger.error('database.initialization_failed', { error });
    throw error;
  }
};

const createTables = () => {
  const database = db;
  if (!database) {
    throw new Error('Database is not initialized');
  }

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      tokenVersion INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients table
  database.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      country TEXT DEFAULT 'India',
      companyName TEXT,
      notes TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products/Guides table
  database.exec(`
    CREATE TABLE IF NOT EXISTS guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      minStock INTEGER DEFAULT 5,
      category TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Invoices table
  database.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceNumber TEXT UNIQUE NOT NULL,
      clientId INTEGER NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      taxPercentage REAL NOT NULL DEFAULT 18,
      total REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      notes TEXT,
      dueDate TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id)
    )
  `);

  // Invoice items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId INTEGER NOT NULL,
      guideId INTEGER NOT NULL,
      guideName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (guideId) REFERENCES guides(id)
    )
  `);

  // Payments table
  database.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      transactionId TEXT,
      paymentDate TEXT DEFAULT CURRENT_TIMESTAMP,
      receiptUrl TEXT,
      notes TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoiceId) REFERENCES invoices(id)
    )
  `);

  // Workers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT NOT NULL,
      commissionRate REAL DEFAULT 0,
      totalEarnings REAL DEFAULT 0,
      performanceScore INTEGER DEFAULT 0,
      joinDate TEXT DEFAULT CURRENT_TIMESTAMP,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stock movements table (for inventory tracking)
  database.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guideId INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reference TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guideId) REFERENCES guides(id)
    )
  `);

  // Create indexes for performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(clientId);
    CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoiceNumber);
    CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoiceId);
    CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoiceId);
    CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
    CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
  `);

  logger.info('database.tables_created');
};

const createDefaultUser = () => {
  try {
    const database = db;
    if (!database) {
      throw new Error('Database is not initialized');
    }

    const stmt = database.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    
    if (result.count === 0) {
      // Hash for "admin123" - in production, use bcrypt
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      const insertStmt = database.prepare(`
        INSERT INTO users (email, password, name, role, tokenVersion)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      insertStmt.run('admin@vjn.com', hashedPassword, 'VJN Admin', 'admin', 0);
      logger.info('database.default_user_created', { email: 'admin@vjn.com' });
    }
  } catch (error) {
    logger.error('database.default_user_creation_failed', { error });
  }
};

export const getDatabase = (): Database.Database => {
  if (!db) {
    return initializeDatabase();
  }
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    logger.info('database.closed');
  }
};

// Backup functionality
export const backupDatabase = (backupPath: string): void => {
  const dbPath = getDbPath();
  fs.copyFileSync(dbPath, backupPath);
  logger.info('database.backup_created', { path: backupPath });
};

// Restore functionality
export const restoreDatabase = (backupPath: string): void => {
  if (db) {
    db.close();
  }
  const dbPath = getDbPath();
  fs.copyFileSync(backupPath, dbPath);
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  logger.info('database.restored', { from: backupPath });
};
