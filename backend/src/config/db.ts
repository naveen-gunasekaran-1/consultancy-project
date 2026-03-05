import { initializeDatabase } from './database';
import { logger } from '../utils/logger';

// Backward-compatible wrapper for old imports.
export const connectDB = async (): Promise<void> => {
  initializeDatabase();
  logger.info('db.connected', { engine: 'sqlite' });
};
