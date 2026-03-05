# Quick Start Guide for Developers

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app on phone)

---

## 📥 Setup Instructions

### 1. Clone & Install

```bash
# Navigate to project directory
cd "VJN WAY TO SUCCESS"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

### 2. Configure Backend

```bash
# In backend folder, create .env file
cd backend
cp .env.example .env

# Edit .env with your settings:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vjn-billing
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 3. Start MongoDB

```bash
# macOS with Homebrew:
brew services start mongodb-community

# Or run directly:
mongod --config /usr/local/etc/mongod.conf
```

### 4. Start Backend Server

```bash
cd backend
npm run dev

# You should see:
# ✅ MongoDB Connected Successfully
# 🚀 Server running on port 5000
```

### 5. Start Frontend

```bash
cd frontend
npm start

# Or with clear cache:
npx expo start --clear
```

### 6. Open App

- **iOS:** Press `i` in terminal (requires Xcode)
- **Android:** Press `a` in terminal (requires Android Studio)
- **Phone:** Scan QR code with Expo Go app

---

## 🎯 What Works Now (Out of the Box)

### ✅ Backend APIs Ready
- All CRUD endpoints defined
- Basic request/response working
- MongoDB connection working
- Mock authentication (any email/password works)

### ✅ Frontend Screens Ready
- Login screen
- Dashboard with stats
- Stock list view
- Billing screen (placeholder)
- Payment list view
- Worker list view
- Client list view
- Reports screen

### ⚠️ What Doesn't Work Yet
- Real authentication (uses mock data)
- Add/Edit forms (not created)
- Stock deduction on invoice
- PDF generation
- Search functionality
- Real reports (shows mock data)
- AI features (shows mock data)

---

## 📋 First Tasks to Implement

### Priority 1: Authentication (1-2 days)

**Backend:**
1. Edit `backend/src/controllers/authController.ts`
2. Replace mock authentication with real database query
3. Add password hashing with bcryptjs

```typescript
// In login function, replace:
const mockUser = { ... }

// With:
const user = await User.findOne({ email });
if (!user) {
  return res.status(401).json({ message: 'Invalid credentials' });
}

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return res.status(401).json({ message: 'Invalid credentials' });
}
```

**Frontend:**
1. Add form validation in `LoginScreen.tsx`
2. Handle proper error messages
3. Update `AuthContext.tsx` to verify tokens properly

### Priority 2: Add/Edit Forms (2-3 days)

**Create these new screens:**

1. `frontend/src/screens/AddGuideScreen.tsx`
   - Form with: name, class, subject, price, quantity, publisher
   - Input validation
   - Call `guideAPI.create(data)`

2. `frontend/src/screens/EditGuideScreen.tsx`
   - Pre-fill form with existing data
   - Call `guideAPI.update(id, data)`

3. Update `StockScreen.tsx`:
   - Add navigation to these screens
   - Pass guide data to EditGuideScreen

```typescript
// In StockScreen.tsx
<TouchableOpacity 
  onPress={() => navigation.navigate('AddGuide')}
>
  <Text>+ Add Guide</Text>
</TouchableOpacity>
```

### Priority 3: Billing Logic (3-4 days)

**Backend:**
1. Update `invoiceController.ts`
2. Implement stock deduction when creating invoice
3. Implement stock restoration when deleting invoice

**Frontend:**
1. Complete `BillingScreen.tsx`
2. Add client selector dropdown
3. Add guide picker with quantity input
4. Calculate totals dynamically
5. Submit invoice to backend

---

## 🗂️ Project Structure Overview

```
VJN WAY TO SUCCESS/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── models/          # Mongoose schemas (✅ Complete)
│   │   ├── controllers/     # Request handlers (⚠️ Has TODOs)
│   │   ├── routes/          # API routes (✅ Complete)
│   │   ├── middleware/      # Auth middleware (⚠️ Basic)
│   │   ├── services/        # Business logic (⚠️ Mock)
│   │   └── server.ts        # Express setup (✅ Complete)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── screens/         # UI screens (✅ Basic UI ready)
│   │   ├── navigation/      # Navigation setup (✅ Complete)
│   │   ├── services/        # API calls (✅ Complete)
│   │   └── context/         # State management (⚠️ Basic)
│   └── package.json
│
├── README.md                # Project overview
├── DEVELOPMENT_ROADMAP.md   # Detailed task list
└── QUICK_START.md          # This file
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Solution 1: Check if MongoDB is running
brew services list | grep mongodb

# Solution 2: Start MongoDB
brew services start mongodb-community

# Solution 3: Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/vjn-billing
```

### Issue: Expo Won't Start
```bash
# Solution 1: Clear cache
cd frontend
rm -rf node_modules .expo
npm install --legacy-peer-deps
npx expo start --clear

# Solution 2: Kill port 8081
lsof -ti:8081 | xargs kill -9
```

### Issue: "Cannot find module" Errors
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: SDK Version Mismatch (Expo Go)
```bash
# Your Expo Go app version must match project SDK
# Check package.json: "expo": "~54.0.0"
# Update Expo Go app from App Store/Play Store
```

---

## 📝 Development Workflow

### 1. Pick a Task
- Review `DEVELOPMENT_ROADMAP.md`
- Pick a task from "CRITICAL TASKS"
- Create a new branch (optional)

### 2. Implement
- Write code
- Test locally
- Handle errors

### 3. Test
```bash
# Backend testing
cd backend
npm run dev
# Use Postman/Thunder Client to test API

# Frontend testing
cd frontend
npm start
# Test on simulator/device
```

### 4. Document
- Add comments explaining complex logic
- Update README if needed
- Check off task in DEVELOPMENT_ROADMAP.md

---

## 🧪 Testing Tips

### Manual API Testing

Use Thunder Client (VS Code extension) or Postman:

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@vjn.com",
  "password": "admin123"
}

// Save the token from response
```

```
GET http://localhost:5000/api/guides
Authorization: Bearer YOUR_TOKEN_HERE
```

### Testing Frontend

1. Add console.log for debugging:
```typescript
console.log('API Response:', response.data);
```

2. Check React Native Debugger (press `j` in Expo)

3. View network calls in Expo DevTools

---

## 💡 Helpful Commands

### Backend
```bash
# Development mode (auto-restart)
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start
```

### Frontend
```bash
# Start Expo
npm start

# Clear cache and start
npx expo start --clear

# Open on specific platform
npm run ios
npm run android

# Update dependencies to match Expo SDK
npx expo install --fix
```

### MongoDB
```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Access MongoDB shell
mongosh

# In mongo shell:
use vjn-billing
db.users.find()
db.guides.find()
```

---

## 📚 Useful Resources

### Documentation
- [Project README](./README.md) - Overview
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md) - All tasks
- [Backend README](./backend/README.md) - API docs
- [Frontend README](./frontend/README.md) - Screen docs

### External Docs
- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

### Tutorials
- MongoDB CRUD: https://www.mongodb.com/docs/manual/crud/
- JWT Auth: https://jwt.io/introduction
- React Native Forms: https://formik.org/docs/guides/react-native

---

## 🎓 Learning Path for New Developers

### Week 1: Setup & Explore
- [ ] Set up development environment
- [ ] Run backend and frontend
- [ ] Explore all existing screens
- [ ] Test all API endpoints with Postman
- [ ] Read through all model definitions

### Week 2: First Feature
- [ ] Implement authentication properly
- [ ] Add form validation
- [ ] Test login flow end-to-end

### Week 3: CRUD Operations
- [ ] Create AddGuideScreen
- [ ] Implement search functionality
- [ ] Add pagination

### Week 4: Business Logic
- [ ] Complete billing screen
- [ ] Implement stock deduction
- [ ] Generate invoices

---

## ⚙️ VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mongodb.mongodb-vscode",
    "rangav.vscode-thunder-client",
    "dsznajder.es7-react-js-snippets",
    "styled-components.vscode-styled-components"
  ]
}
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT - Before Production:**

1. Change JWT_SECRET in .env to a strong random string
2. Enable authentication middleware on all routes
3. Add rate limiting to prevent abuse
4. Validate all user inputs
5. Use HTTPS in production
6. Never commit .env file to git

---

## 📞 Getting Help

1. Check this Quick Start Guide
2. Review task documents for things to build (see below)
3. Look for TODO comments in code
4. Check console/terminal for error messages
5. Search Stack Overflow for specific errors

---

## 🎯 What Should I Build Next?

Now that you're set up, pick a task based on your experience:

### For Beginners (1-3 hours each)
→ **[Simple Frontend Tasks](SIMPLE_FRONTEND_TASKS.md)**
- Add icons to navigation
- Add pull-to-refresh
- Create confirmation dialogs
- Add search functionality
- Add loading indicators

### For Intermediate Developers (4-12 hours)
→ **[Teammate Tasks](TEAMMATE_TASKS.md)**
- Create Add/Edit Guide screens (complete CRUD)
- Build full Billing screen with invoice generation

### For Advanced Planning
→ **[Development Roadmap](DEVELOPMENT_ROADMAP.md)**
- Complete feature breakdown
- All remaining work organized by priority
- Implementation guides with code examples

---

## ✅ Checklist: "Am I Ready to Start?"

- [ ] Node.js installed (check: `node --version`)
- [ ] MongoDB running (check: `mongosh`)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server starts successfully
- [ ] Frontend app opens on simulator/device
- [ ] Can see login screen
- [ ] Can see dashboard after login

**All checked?** You're ready! 🎉

Pick a task from the documents above and start coding!

---

**Happy Coding! 🚀**
