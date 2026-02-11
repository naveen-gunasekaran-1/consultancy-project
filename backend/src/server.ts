import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { config } from './config/env';

// Import routes
import authRoutes from './routes/authRoutes';
import guideRoutes from './routes/guideRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import workerRoutes from './routes/workerRoutes';
import clientRoutes from './routes/clientRoutes';
import reportRoutes from './routes/reportRoutes';
import aiRoutes from './routes/aiRoutes';

// Import middleware
import { authMiddleware } from './middleware/authMiddleware';

const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Protected routes (TODO: Add authMiddleware to secure these routes)
app.use('/api/guides', guideRoutes); // TODO: Add authMiddleware
app.use('/api/invoices', invoiceRoutes); // TODO: Add authMiddleware
app.use('/api/payments', paymentRoutes); // TODO: Add authMiddleware
app.use('/api/workers', workerRoutes); // TODO: Add authMiddleware
app.use('/api/clients', clientRoutes); // TODO: Add authMiddleware
app.use('/api/reports', reportRoutes); // TODO: Add authMiddleware
app.use('/api/ai', aiRoutes); // TODO: Add authMiddleware

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
});

export default app;
