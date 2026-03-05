# VJN Billing System - 50% Complete Quick Reference Guide

## 🚀 Quick Start (5 minutes)

### 1. Start Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MongoDB URI and JWT Secret
npm run dev
# Backend runs on: http://localhost:5000
```

### 2. Start Desktop App
```bash
cd desktop
npm install
cp .env.example .env
npm run dev
# Desktop app window opens automatically
```

### 3. Test Login
```
Email: test@example.com (or register new)
Password: password123 (min 6 chars)
```

---

## 📁 Project Structure

### Desktop App (`desktop/src/`)
```
src/
├── screens/              # All UI pages
│   ├── LoginScreen.tsx   # Auth (done ✅)
│   ├── DashboardScreen.tsx
│   ├── GuidesScreen.tsx  # Full CRUD (done ✅)
│   ├── ClientsScreen.tsx # Placeholder
│   ├── InvoicesScreen.tsx
│   ├── PaymentsScreen.tsx
│   └── WorkersScreen.tsx
├── components/
│   └── Sidebar.tsx       # Navigation (done ✅)
├── context/
│   └── AuthContext.tsx   # Auth state (done ✅)
├── services/
│   └── api.ts            # API calls (done ✅)
├── utils/
│   ├── validation.ts     # Form validation (done ✅)
│   └── helpers.ts        # Utilities
├── App.tsx               # Main component
└── index.tsx             # Entry point
```

### Backend (`backend/src/`)
```
src/
├── controllers/          # Business logic
│   └── authController.ts # Auth (done ✅)
├── models/
│   ├── User.ts          # Updated (done ✅)
│   ├── Guide.ts
│   ├── Client.ts
│   ├── Invoice.ts
│   ├── Payment.ts
│   └── Worker.ts
├── routes/              # API endpoints
├── middleware/
│   └── authMiddleware.ts # Protected routes
├── config/
│   ├── db.ts
│   └── env.ts
└── server.ts            # Express setup
```

---

## 🔐 Authentication Flow

```
User Registration/Login
    ↓
LoginScreen.tsx (validates form)
    ↓
api.ts (POST auth/login or auth/register)
    ↓
Backend validates & hashes password
    ↓
JWT token generated
    ↓
Token stored in localStorage
    ↓
User redirected to Dashboard
    ↓
Auth token auto-added to all API requests
```

---

## ✅ Completed Features

### Authentication (100%)
- ✅ User registration with validation
- ✅ User login with JWT
- ✅ Password hashing (bcryptjs)
- ✅ Token persistence
- ✅ Protected routes

### Desktop UI (100%)
- ✅ Professional login screen
- ✅ Dashboard with stats
- ✅ Sidebar navigation
- ✅ Responsive design
- ✅ Error handling

### Guides Module (100%)
- ✅ List guides
- ✅ Add guide
- ✅ Edit guide
- ✅ Delete guide
- ✅ Form validation

### Form Validation (100%)
- ✅ Email validation
- ✅ Password validation
- ✅ Guide form validation
- ✅ Client form validator
- ✅ Worker form validator

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/login          (email, password)
POST   /api/auth/register       (email, password, fullName)
GET    /api/auth/verify         (Protected)
```

### Guides (All Protected)
```
GET    /api/guides              (List with pagination)
GET    /api/guides/:id          (Get one)
POST   /api/guides              (Create)
PUT    /api/guides/:id          (Update)
DELETE /api/guides/:id          (Delete)
```

### Other Modules (Protected)
```
/api/clients
/api/invoices
/api/payments
/api/workers
/api/reports
```

---

## 🛠 Common Tasks

### Add a New Screen
1. Create `desktop/src/screens/NewScreen.tsx`
2. Add to `App.tsx` routes
3. Add to Sidebar navigation
4. Create corresponding CSS file

### Add API Integration
1. Add method to `desktop/src/services/api.ts`
2. Use in component: `await newAPI.create(data)`
3. Update AuthContext if needed

### Add Form Validation
1. Add validator to `desktop/src/utils/validation.ts`
2. Import in component
3. Call before submit: `const errors = validateForm(data)`
4. Display errors: `errors.map(e => <div>{e.message}</div>)`

### Connect Backend Endpoint
1. Ensure route exists in backend
2. Add to api.ts services
3. Call from component
4. Handle response and errors

---

## 🐛 Debugging

### Check if Backend is Working
```bash
curl http://localhost:5000
# Should return: {"message":"API running..."}
```

### Check Token in Browser
```javascript
// In console
localStorage.getItem('authToken')
```

### View Network Requests
```
Chrome DevTools → Network tab
→ Filter XHR requests
→ Check headers for "Authorization"
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Backend not responding" | Check if `npm run dev` is running in backend folder |
| "Login fails but no error" | Check browser console for actual error message |
| "CORS error" | Backend not started or API URL incorrect |
| "Blank screen after login" | Check browser console for React errors |

---

## 📊 Project Progress

```
Foundation (done)                  ▓▓▓▓▓▓▓▓▓▓ 30%
Desktop App + Core Features (done) ▓▓▓▓▓▓▓▓▓▓ 50%
Advanced Modules (TODO)            ░░░░░░░░░░ 50%
```

---

## 🎯 Next Features to Build (Remaining 50%)

1. **Clients Module** (Similar to Guides)
   - Use same pattern as GuidesScreen
   - Form fields: name, email, phone, address
   - Same CRUD operations

2. **Invoices Module**
   - Select guides in invoice
   - Calculate totals
   - Track invoice status

3. **Payments Module**
   - Record payments against invoices
   - Track payment status
   - Generate receipts

4. **Workers Module**
   - Worker list with performance
   - Commission tracking
   - Worker details

5. **Reports Module**
   - Sales reports
   - Inventory reports
   - Financial reports

---

## 💡 Best Practices

### Before Adding Code
1. Check if validation exists in `validation.ts`
2. Reuse components from existing screens
3. Use consistent naming conventions
4. Follow existing folder structure

### When Creating Components
```typescript
// Always type your props
interface ScreenProps {
  // props here
}

// Use hooks for state
const [data, setData] = useState([]);

// Handle errors gracefully
try {
  // API call
} catch (error) {
  // Show error to user
}
```

### Error Handling
```typescript
// Always display user-friendly errors
try {
  await api.call();
} catch (error: any) {
  setError(error.response?.data?.message || 'Something went wrong');
}
```

---

## 📞 Resources

- [Desktop App README](./desktop/README.md)
- [50% Report](./50_PERCENT_COMPLETION_REPORT.md)
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md)
- [Quick Start Guide](./QUICK_START.md)

---

**Everything needed to continue development is in place!** 🚀

Next developer can use this guide to:
- Understand the codebase
- Add new modules following the same pattern
- Debug issues quickly
- Maintain consistency
