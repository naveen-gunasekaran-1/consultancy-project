# 🚀 How to Run VJN Billing System

## Single Command (Recommended - Standalone)

```bash
cd "/Users/naveengunasekaran/Desktop/PROJECTs/VJN WAY TO SUCCESS"
npm start
```

**This will:**
- ✅ Start MongoDB (if not running)
- ✅ Start desktop app (Electron)
- ✅ Auto-start backend on port 5000
- ✅ Bootstrap the single admin user if needed
- ✅ Login screen opens automatically

---

## First Time Setup

### Prerequisites
Ensure you have installed:
- **Node.js** (v16+)
- **MongoDB** (local or connection string in `.env`)
- **npm** (comes with Node.js)

### Installation
```bash
# Run installation script once
bash install.sh

# This installs:
# - Backend dependencies
# - Desktop dependencies
# - Sets up .env files
```

---

## Running the Application

### Option 1: Desktop Only (Recommended)
```bash
cd "/Users/naveengunasekaran/Desktop/PROJECTs/VJN WAY TO SUCCESS/desktop"
npm start
```
The backend will auto-start in the background.

### Option 2: Manual Backend Start (For Development)
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start desktop
cd desktop
npm start
```

### Option 3: Backend Only (API Testing)
```bash
cd backend
npm run dev
```
- API runs on: `http://localhost:5000/api`
- Use Postman/curl to test endpoints

---

## 🔐 Login Credentials

**Single-User Mode** - Only one user can exist:

| Field | Value |
|-------|-------|
| **Email** | `admin@vjn.com` |
| **Password** | `admin123` |

> ⚠️ **First time only:** Change password after login in production!

---

## Environment Configuration

### Backend (`backend/.env`)
```dotenv
# Server
PORT=5000
NODE_ENV=development
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb://localhost:27017/vjn-billing

# Auth
JWT_SECRET=your_super_secret_jwt_key_change_this

# Single User (Auto-Bootstrap)
SINGLE_USER_EMAIL=admin@vjn.com
SINGLE_USER_PASSWORD=admin123
SINGLE_USER_FULL_NAME=Administrator
```

### Desktop (`desktop/.env`)
```dotenv
REACT_APP_API_URL=http://localhost:5000/api
```

---

## API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```
Response: `{ message: 'VJN Way To Success - Billing & Inventory API', version: '1.0.0', status: 'running' }`

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vjn.com","password":"admin123"}'
```

### Get Token from Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@vjn.com",
    "fullName": "Administrator",
    "role": "admin"
  }
}
```

### Protected Endpoints (Add Header)
```bash
curl http://localhost:5000/api/guides \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Features Available

### ✅ Implemented (50% Complete)
- User authentication with secure JWT
- Guide management (CRUD)
- Single-session enforcement (new login invalidates previous)
- Structured JSON logging
- Token-based authorization
- Professional UI
- Electron standalone app

### ⏳ Coming Soon (50% Remaining)
- Client management
- Invoice system
- Payment tracking
- Worker management
- Reports & analytics

---

## 🔍 Viewing Logs

### Backend Logs (JSON format)
```bash
# While backend is running, logs appear in console
# Or check log file:
tail -f /tmp/vjn-backend.log
```

### Example Log Entry
```json
{
  "timestamp": "2026-03-05T10:30:45.123Z",
  "level": "info",
  "message": "auth.login.success",
  "meta": {
    "requestId": "uuid-here",
    "userId": "mongo-id"
  }
}
```

---

## 🛑 Stopping the App

### Desktop (Recommended)
- Close the Electron window
- Backend will automatically shut down

### Manual Stop
```bash
# Kill backend
pkill -f "npm run dev"

# Kill desktop
lsof -ti:3000 | xargs kill -9

# Stop MongoDB
brew services stop mongodb-community
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Port 3000 (desktop dev)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Failed
```bash
# Start MongoDB
brew services start mongodb-community

# Verify it's running
pgrep mongod
```

### Login Screen Won't Load
1. Check backend is running: `curl http://localhost:5000/api`
2. Check browser console (F12) for errors
3. Verify `.env` file has `REACT_APP_API_URL=http://localhost:5000/api`

### "Session Expired" After Login
- This happens if another login occurs (single-session enforcement)
- Clear localStorage and login again
- Or restart the app

---

## 📈 Development Mode

### Watch Files & Hot Reload
```bash
# Backend (auto-restart on file change)
cd backend && npm run dev

# Desktop (auto-reload on file change)
cd desktop && npm start
```

### TypeScript Compilation
```bash
# Check for errors
cd backend && npm run build

# Desktop builds automatically
```

### Testing API
```bash
# Use curl, Postman, or Thunder Client
# Add Authorization header: Bearer YOUR_TOKEN
```

---

## 🎯 Quick Commands

| Command | What It Does |
|---------|-------------|
| `npm start` | Run entire app (backend + desktop) |
| `cd backend && npm run dev` | Backend development server |
| `cd desktop && npm start` | Desktop dev with hot reload |
| `cd backend && npm run build` | Compile backend TypeScript |
| `cd desktop && npm run react-build` | Build optimized desktop app |
| `bash install.sh` | First-time setup |
| `npm audit fix` | Fix security vulnerabilities |

---

## 📱 Application Flow

```
1. User launches desktop app
   ↓
2. Electron checks if backend (port 5000) is running
   ↓
3. If not: Auto-starts backend process
   ↓
4. Backend connects to MongoDB
   ↓
5. Backend creates single admin user (if none exists)
   ↓
6. Desktop renders login screen
   ↓
7. User enters credentials (admin@vjn.com / admin123)
   ↓
8. Backend verifies, issues JWT token
   ↓
9. Desktop stores token, redirects to dashboard
   ↓
10. All subsequent API calls include token
```

---

## 🔒 Security Notes

### Single-User Mode
- Only one account exists: `admin@vjn.com`
- New login invalidates previous session (token versioning)
- All other login attempts return `401 Unauthorized`

### Token Security
- JWT expires in 7 days
- Stored in browser localStorage (for desktop)
- Included in `Authorization: Bearer` header
- Server validates token version on every request

### Password Security
- Hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Never transmitted except during login

---

## 📞 Support

**Issue?** Check these files:
- Setup: [QUICK_START.md](QUICK_START.md)
- Technical: [50_PERCENT_COMPLETION_REPORT.md](50_PERCENT_COMPLETION_REPORT.md)
- Reference: [DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)
- Status: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

---

**Ready to go!** 🎉

Start with:
```bash
cd "/Users/naveengunasekaran/Desktop/PROJECTs/VJN WAY TO SUCCESS/desktop"
npm start
```
