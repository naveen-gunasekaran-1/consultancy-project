import { Request, Response } from 'express';
import { DatabaseBackup } from '../utils/databaseBackup';
import { logger } from '../utils/logger';
import fs from 'fs';

export const createBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('backup.create', {
      requestId: req.headers['x-request-id'],
      user: (req as any).user?.email,
    });

    const backupPath = await DatabaseBackup.createBackup();
    const stats = fs.statSync(backupPath);
    const filename = backupPath.split('/').pop() || 'backup.db';

    logger.info('backup.create.success', {
      requestId: req.headers['x-request-id'],
      filename,
      size: stats.size,
    });

    res.status(200).json({
      success: true,
      message: 'Database backup created successfully',
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
      },
    });
  } catch (error) {
    logger.error('backup.create.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listBackups = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('backup.list', {
      requestId: req.headers['x-request-id'],
    });

    const backups = await DatabaseBackup.listBackups();

    logger.info('backup.list.success', {
      requestId: req.headers['x-request-id'],
      count: backups.length,
    });

    res.status(200).json({
      success: true,
      count: backups.length,
      data: backups,
    });
  } catch (error) {
    logger.error('backup.list.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const downloadBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    logger.info('backup.download', {
      requestId: req.headers['x-request-id'],
      filename,
    });

    const backups = await DatabaseBackup.listBackups();
    const backup = backups.find((b) => b.filename === filename);

    if (!backup) {
      res.status(404).json({
        success: false,
        message: 'Backup file not found',
      });
      return;
    }

    logger.info('backup.download.success', {
      requestId: req.headers['x-request-id'],
      filename,
      size: backup.size,
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', backup.size.toString());

    const fileStream = fs.createReadStream(backup.path);
    fileStream.pipe(res);
  } catch (error) {
    logger.error('backup.download.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to download backup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const restoreBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    logger.info('backup.restore', {
      requestId: req.headers['x-request-id'],
      filename,
      user: (req as any).user?.email,
    });

    await DatabaseBackup.restoreBackup(filename);

    logger.info('backup.restore.success', {
      requestId: req.headers['x-request-id'],
      filename,
    });

    res.status(200).json({
      success: true,
      message: 'Database restored successfully. Please restart the application.',
      warning: 'Application restart required to use restored database',
    });
  } catch (error) {
    logger.error('backup.restore.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to restore backup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    logger.info('backup.delete', {
      requestId: req.headers['x-request-id'],
      filename,
      user: (req as any).user?.email,
    });

    await DatabaseBackup.deleteBackup(filename);

    logger.info('backup.delete.success', {
      requestId: req.headers['x-request-id'],
      filename,
    });

    res.status(200).json({
      success: true,
      message: 'Backup deleted successfully',
    });
  } catch (error) {
    logger.error('backup.delete.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const cleanupBackups = async (req: Request, res: Response): Promise<void> => {
  try {
    const keepCount = parseInt(req.query.keep as string, 10) || 10;

    logger.info('backup.cleanup', {
      requestId: req.headers['x-request-id'],
      keepCount,
      user: (req as any).user?.email,
    });

    const deletedCount = await DatabaseBackup.cleanupOldBackups(keepCount);

    logger.info('backup.cleanup.success', {
      requestId: req.headers['x-request-id'],
      deletedCount,
    });

    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} old backup(s)`,
      deletedCount,
    });
  } catch (error) {
    logger.error('backup.cleanup.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup backups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBackupStats = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('backup.stats', {
      requestId: req.headers['x-request-id'],
    });

    const stats = await DatabaseBackup.getBackupStats();

    logger.info('backup.stats.success', {
      requestId: req.headers['x-request-id'],
      totalBackups: stats.totalBackups,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('backup.stats.error', {
      requestId: req.headers['x-request-id'],
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get backup statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
