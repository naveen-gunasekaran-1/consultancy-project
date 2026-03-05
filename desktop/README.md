# DESKTOP APP - VJN Billing System

This is the Electron desktop application for the VJN Billing & Inventory Management System.

## Setup & Installation

### Prerequisites
- Node.js 16+ installed
- Backend server running on http://localhost:5000

### Installation Steps

```bash
# Navigate to desktop folder
cd desktop

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development mode (runs both React dev server and Electron)
npm run dev

# Or build for production
npm run build
```

## Features Implemented

### ✅ Completed (50%)

**Authentication**
- User registration with validation
- User login with JWT tokens
- Protected routes with auth middleware
- Session persistence

**Desktop UI**
- Modern login screen with registration option
- Dashboard with key statistics
- Sidebar navigation with 6 modules
- Professional styling with responsive design

**Guides Management**
- View all guides with pagination
- Add new guides with validation
- Edit existing guides
- Delete guides
- Form validation for all fields

**Form Validation**
- Email format validation
- Password strength validation
- Guide form field validation
- Reusable validation utilities

### 📋 Screens Implemented

1. **LoginScreen** - Registration and login with full validation
2. **DashboardScreen** - Main dashboard with statistics
3. **GuidesScreen** - Full CRUD operations for guides
4. **ClientsScreen** - Placeholder (coming soon)
5. **InvoicesScreen** - Placeholder (coming soon)
6. **PaymentsScreen** - Placeholder (coming soon)
7. **WorkersScreen** - Placeholder (coming soon)

## Architecture

```
desktop/
├── src/
│   ├── screens/          # UI screens
│   ├── components/       # Reusable components
│   ├── context/          # Auth context
│   ├── services/         # API integration
│   ├── utils/            # Utilities & validation
│   ├── App.tsx           # Main app component
│   └── index.tsx         # Entry point
├── public/
│   ├── electron.js       # Electron main process
│   └── index.html        # HTML template
├── package.json
└── tsconfig.json

backend/ (Updated)
├── src/models/
│   └── User.ts           # Updated with fullName field
├── src/controllers/
│   └── authController.ts # Real implementation
└── ... (other files)
```

## API Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/guides` - Get all guides
- `GET /api/guides/:id` - Get guide by ID
- `POST /api/guides` - Create new guide
- `PUT /api/guides/:id` - Update guide
- `DELETE /api/guides/:id` - Delete guide

## Next Steps (Remaining 50%)

1. **Clients Module**
   - Create client management screen
   - Add/edit/delete client functionality
   - Client validation form

2. **Invoices Module**
   - Invoice creation with guide selection
   - Invoice listing and filtering
   - Invoice detail view

3. **Payments Module**
   - Payment recording interface
   - Payment tracking
   - Payment reconciliation

4. **Workers Module**
   - Worker management screen
   - Worker performance tracking
   - Commission calculation

5. **Reports Module**
   - Sales reports
   - Inventory reports
   - Financial reports

6. **Advanced Features**
   - Bulk operations
   - Export to CSV/PDF
   - Email notifications
   - Advanced filtering & search
   - Analytics dashboard

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Testing
```bash
# Add testing as needed
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Electron 27** - Desktop framework
- **CSS3** - Styling

## Notes

- Backend server must be running for the desktop app to work
- All API calls include Authorization header with JWT token
- Session data is persisted in localStorage
- Form validation is done both on client and server
