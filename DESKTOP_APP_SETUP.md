# VJN Billing - Project Setup Guide

This guide covers the complete setup for the VJN Billing system with the new desktop application.

## Project Structure

```
VJN WAY TO SUCCESS/
├── backend/        # Express.js REST API
├── frontend/       # React Native mobile app (deprecated)
├── desktop/        # NEW: Electron desktop app
└── README.md
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update MongoDB URI and JWT secret in .env
# Then build TypeScript
npm run build

# Start development server (for testing)
npm run dev
```

### 2. Desktop App Setup

```bash
cd desktop

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development (automatically starts backend)
npm run dev
```

## Architecture Overview

### Desktop App Flow

```
┌─────────────────────────────────────────┐
│   Electron Main Process (main.ts)       │
│   - Manages window                      │
│   - Spawns Express server               │
│   - IPC communication                   │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴──────────┐
        ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│ Express Backend  │  │ React Frontend   │
│ (child process)  │  │ (renderer)       │
│ Port 3000        │  │ Port 3000 (dev)  │
│                  │  │                  │
│ - API routes     │  │ - Pages          │
│ - DB queries     │  │ - Components     │
│ - Auth           │  │ - Routing        │
└──────────────────┘  └──────────────────┘
```

## Development Workflow

### Terminal 1: Start Desktop App (includes backend)
```bash
cd desktop
npm run dev
```

### Or run separately for testing:

**Terminal 1: Backend**
```bash
cd backend
npm run build
npm start
```

**Terminal 2: Desktop**
```bash
cd desktop
npm run dev:renderer
```

## Features Implemented

### Desktop Application
- ✅ Electron + React setup
- ✅ Modern desktop UI
- ✅ Bundled Express backend
- ✅ JWT authentication
- ✅ All core features:
  - Dashboard with stats
  - Stock/Inventory management
  - Billing & Invoicing
  - Payment tracking
  - Client management
  - Worker management
  - Reports & Analytics

### Available Screens
- **Login**: User authentication
- **Dashboard**: Overview with stats
- **Stock**: Manage educational guides
- **Billing**: View invoices
- **Payments**: Track payments
- **Clients**: Manage schools
- **Workers**: Manage employees
- **Reports**: View analytics

## Building for Production

### macOS Build
```bash
cd desktop
npm run package:mac
```

### Windows Build
```bash
cd desktop
npm run package:win
```

Output will be in `desktop/dist/`

## Database Setup

For production MongoDB:
1. Set up MongoDB Atlas or local MongoDB
2. Update `backend/.env` with MongoDB URI
3. Models are already defined in `backend/src/models/`

For offline/local data (future enhancement):
- Consider SQLite for local caching
- Implement sync mechanism when online

## API Endpoints

The backend provides REST API at `http://localhost:3000/api`:

- `/auth/*` - Authentication
- `/guides/*` - Stock management
- `/invoices/*` - Billing
- `/payments/*` - Payments
- `/clients/*` - Client management
- `/workers/*` - Worker management
- `/reports/*` - Analytics
- `/ai/*` - AI features

See `backend/README.md` for full API documentation.

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### TypeScript compilation errors
```bash
# Navigate to desktop
cd desktop
npm run build:main
```

### Backend doesn't start
- Ensure backend is built: `cd backend && npm run build`
- Check MongoDB connection string in `.env`
- Verify Node.js version (16+)

## Next Steps

1. **Deploy Backend**
   - Set up MongoDB Atlas
   - Deploy to cloud (Heroku, AWS, etc.)
   - Update API URL in desktop app

2. **Sign Application**
   - macOS: Code signing certificate
   - Windows: Code signing certificate
   - Set in `desktop/package.json` build config

3. **Auto-Update**
   - Configure electron-updater
   - Set up release server

4. **Production Rollout**
   - Create installer for users
   - Set up update mechanism
   - Monitor errors and usage

## Support

For issues:
1. Check individual README files in backend/ and desktop/
2. Verify all prerequisites are installed
3. Check console logs for errors
4. Ensure .env files are properly configured
