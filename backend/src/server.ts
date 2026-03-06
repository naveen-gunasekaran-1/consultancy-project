import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { initializeDatabase, closeDatabase } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/authRoutes';
import guideRoutes from './routes/guideRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import workerRoutes from './routes/workerRoutes';
import clientRoutes from './routes/clientRoutes';
import orderRoutes from './routes/orderRoutes';
import reportRoutes from './routes/reportRoutes';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import systemRoutes from './routes/systemRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import backupRoutes from './routes/backupRoutes';

// Import middleware
import { authMiddleware } from './middleware/authMiddleware';
import { requestLogger } from './middleware/requestLogger';

const app: Application = express();

console.log('[Server] Starting initialization...');
console.log('[Server] Node version:', process.version);
console.log('[Server] Platform:', process.platform);
console.log('[Server] SQLITE_DB_PATH:', process.env.SQLITE_DB_PATH);
console.log('[Server] PORT:', config.port);

// Initialize SQLite Database
try {
  initializeDatabase();
  console.log('[Server] Database initialized successfully');
} catch (error) {
  console.error('[Server] Failed to initialize database:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'VJN Way To Success - Billing & Inventory API',
    version: '1.0.0',
    status: 'running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Public system routes
app.use('/api/system', systemRoutes);

// Protected routes
app.use('/api/guides', authMiddleware, guideRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/workers', authMiddleware, workerRoutes);
app.use('/api/clients', authMiddleware, clientRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/backup', authMiddleware, backupRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn('request.not_found', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('request.unhandled_error', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    error: err,
  });
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log('[Server] Express server listening on port:', PORT);
  logger.info('server.started', {
    port: PORT,
    environment: config.nodeEnv,
    logLevel: config.logLevel,
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('server.shutting_down');
  server.close(() => {
    closeDatabase();
    logger.info('server.stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('server.shutting_down');
  server.close(() => {
    closeDatabase();
    logger.info('server.stopped');
    process.exit(0);
  });
});

export default app;
