import { Router } from 'express';
import {
  createBackup,
  listBackups,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  cleanupBackups,
  getBackupStats,
} from '../controllers/backupController';

const router = Router();

/**
 * @route   POST /api/backup
 * @desc    Create a new database backup
 * @access  Protected (Admin only recommended)
 */
router.post('/', createBackup);

/**
 * @route   GET /api/backup
 * @desc    List all available backups
 * @access  Protected
 */
router.get('/', listBackups);

/**
 * @route   GET /api/backup/stats
 * @desc    Get backup statistics
 * @access  Protected
 */
router.get('/stats', getBackupStats);

/**
 * @route   POST /api/backup/cleanup
 * @desc    Clean up old backups (keep only recent N backups)
 * @access  Protected (Admin only recommended)
 * @query   keep - Number of backups to keep (default: 10)
 */
router.post('/cleanup', cleanupBackups);

/**
 * @route   GET /api/backup/:filename/download
 * @desc    Download a specific backup file
 * @access  Protected
 */
router.get('/:filename/download', downloadBackup);

/**
 * @route   POST /api/backup/:filename/restore
 * @desc    Restore database from a backup
 * @access  Protected (Admin only recommended)
 */
router.post('/:filename/restore', restoreBackup);

/**
 * @route   DELETE /api/backup/:filename
 * @desc    Delete a specific backup
 * @access  Protected (Admin only recommended)
 */
router.delete('/:filename', deleteBackup);

export default router;
