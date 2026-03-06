import { Router, Request, Response } from 'express';

const APP_VERSION = '1.0.0';

const router = Router();

/**
 * @route   GET /api/system/version
 * @desc    Get application version for update checking
 * @access  Public
 */
router.get('/version', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    version: APP_VERSION,
    latestVersion: APP_VERSION,
    updateAvailable: false,
    downloadUrl: 'https://example.com/app-update',
  });
});

/**
 * @route   GET /api/system/info
 * @desc    Get system information
 * @access  Public
 */
router.get('/info', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    appName: 'VJN Way To Success',
    version: APP_VERSION,
    environment: process.env.NODE_ENV || 'production',
  });
});

export default router;
