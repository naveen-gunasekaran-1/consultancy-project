import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { closeDatabase } from '../config/database';

const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export class DatabaseBackup {
  /**
   * Create a backup of the database
   */
  static async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}.db`;
      const backupPath = path.join(BACKUP_DIR, backupFileName);

      // Get the current database path
      const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../data/erp.db');

      // Check if database file exists
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found: ${dbPath}`);
      }

      // Copy the database file
      fs.copyFileSync(dbPath, backupPath);

      logger.info('database.backup.success', {
        backupPath,
        backupSize: fs.statSync(backupPath).size,
      });

      return backupPath;
    } catch (error) {
      logger.error('database.backup.error', { error });
      throw new Error('Failed to create database backup');
    }
  }

  /**
   * List all available backups
   */
  static async listBackups(): Promise<Array<{
    filename: string;
    path: string;
    size: number;
    created: Date;
  }>> {
    try {
      const files = fs.readdirSync(BACKUP_DIR);
      const backups = files
        .filter((file) => file.endsWith('.db'))
        .map((file) => {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      logger.info('database.backup.list', {
        count: backups.length,
      });

      return backups;
    } catch (error) {
      logger.error('database.backup.list.error', { error });
      throw new Error('Failed to list backups');
    }
  }

  /**
   * Restore database from a backup
   */
  static async restoreBackup(backupFileName: string): Promise<void> {
    try {
      const backupPath = path.join(BACKUP_DIR, backupFileName);

      // Check if backup file exists
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupFileName}`);
      }

      const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../data/erp.db');

      // Create a backup of current database before restoring
      const currentTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const preRestoreBackup = path.join(BACKUP_DIR, `pre_restore_${currentTimestamp}.db`);
      
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, preRestoreBackup);
        logger.info('database.backup.pre_restore', {
          preRestoreBackup,
        });
      }

      // Close current database connections
      closeDatabase();

      // Restore the backup
      fs.copyFileSync(backupPath, dbPath);

      logger.info('database.backup.restore.success', {
        backupFile: backupFileName,
        restoredTo: dbPath,
      });

      // Note: Application may need to be restarted to reconnect to the restored database
    } catch (error) {
      logger.error('database.backup.restore.error', { error });
      throw new Error('Failed to restore database backup');
    }
  }

  /**
   * Delete a backup file
   */
  static async deleteBackup(backupFileName: string): Promise<void> {
    try {
      const backupPath = path.join(BACKUP_DIR, backupFileName);

      // Check if backup file exists
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupFileName}`);
      }

      fs.unlinkSync(backupPath);

      logger.info('database.backup.delete.success', {
        backupFile: backupFileName,
      });
    } catch (error) {
      logger.error('database.backup.delete.error', { error });
      throw new Error('Failed to delete backup');
    }
  }

  /**
   * Clean up old backups (keep only last N backups)
   */
  static async cleanupOldBackups(keepCount: number = 10): Promise<number> {
    try {
      const backups = await this.listBackups();

      if (backups.length <= keepCount) {
        return 0;
      }

      const backupsToDelete = backups.slice(keepCount);
      let deletedCount = 0;

      for (const backup of backupsToDelete) {
        try {
          await this.deleteBackup(backup.filename);
          deletedCount++;
        } catch (error) {
          logger.warn('database.backup.cleanup.delete_failed', {
            filename: backup.filename,
            error,
          });
        }
      }

      logger.info('database.backup.cleanup.success', {
        deletedCount,
        remaining: backups.length - deletedCount,
      });

      return deletedCount;
    } catch (error) {
      logger.error('database.backup.cleanup.error', { error });
      throw new Error('Failed to cleanup old backups');
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  }> {
    try {
      const backups = await this.listBackups();

      if (backups.length === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          oldestBackup: null,
          newestBackup: null,
        };
      }

      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      const oldestBackup = backups[backups.length - 1].created;
      const newestBackup = backups[0].created;

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup,
        newestBackup,
      };
    } catch (error) {
      logger.error('database.backup.stats.error', { error });
      throw new Error('Failed to get backup statistics');
    }
  }
}
