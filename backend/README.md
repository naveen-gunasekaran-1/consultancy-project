# VJN Way To Success - Backend

Backend API for Billing and Inventory Management System

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register user
- GET `/api/auth/verify` - Verify token

### Guides
- GET `/api/guides` - Get all guides
- GET `/api/guides/:id` - Get guide by ID
- POST `/api/guides` - Create guide
- PUT `/api/guides/:id` - Update guide
- DELETE `/api/guides/:id` - Delete guide

### Invoices
- GET `/api/invoices` - Get all invoices
- GET `/api/invoices/:id` - Get invoice by ID
- POST `/api/invoices` - Create invoice
- PUT `/api/invoices/:id` - Update invoice
- DELETE `/api/invoices/:id` - Delete invoice

### Payments
- GET `/api/payments` - Get all payments
- GET `/api/payments/:id` - Get payment by ID
- POST `/api/payments` - Create payment
- PUT `/api/payments/:id/status` - Update payment status

### Workers
- GET `/api/workers` - Get all workers
- GET `/api/workers/:id` - Get worker by ID
- POST `/api/workers` - Create worker
- PUT `/api/workers/:id` - Update worker
- DELETE `/api/workers/:id` - Delete worker

### Clients
- GET `/api/clients` - Get all clients
- GET `/api/clients/:id` - Get client by ID
- POST `/api/clients` - Create client
- PUT `/api/clients/:id` - Update client
- DELETE `/api/clients/:id` - Delete client

### Reports
- GET `/api/reports/stock` - Stock report
- GET `/api/reports/sales` - Sales report
- GET `/api/reports/payments` - Payment report
- GET `/api/reports/clients` - Client report
- GET `/api/reports/dashboard` - Dashboard stats

### AI Analysis
- GET `/api/ai/sales-trends` - Sales trend analysis
- GET `/api/ai/stock-prediction` - Stock prediction
- GET `/api/ai/recommendations` - AI recommendations

## Development Notes

- Most endpoints return mock/placeholder data
- Add `authMiddleware` to protected routes before production
- Implement proper validation for all endpoints
- Add rate limiting and security headers
