# VJN Way To Success - Frontend

React Native mobile app for Billing and Inventory Management System

## Tech Stack
- React Native (Expo)
- TypeScript
- React Navigation
- Axios for API calls
- AsyncStorage for local storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL:
   - Edit `src/services/api.ts`
   - Change `API_BASE_URL` to your backend URL

3. Start the app:
```bash
npm start
```

4. Run on specific platform:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Project Structure

```
frontend/
├── src/
│   ├── screens/          # All screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── StockScreen.tsx
│   │   ├── BillingScreen.tsx
│   │   ├── PaymentScreen.tsx
│   │   ├── WorkerScreen.tsx
│   │   ├── ClientScreen.tsx
│   │   └── ReportsScreen.tsx
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   └── context/          # React Context
│       └── AuthContext.tsx
├── App.tsx               # Root component
└── package.json
```

## Screens Overview

- **Login**: User authentication
- **Dashboard**: Overview stats and quick actions
- **Stock**: Guide inventory management (CRUD)
- **Billing**: Create invoices
- **Payment**: Track payment status
- **Worker**: Manage workers
- **Client**: Manage client/school data
- **Reports**: View analytics and AI insights

## Development Notes

- All screens have basic UI layout with placeholder functionality
- API calls are configured but need backend running
- Add proper form validation before production
- Implement edit/add screens for Stock, Workers, and Clients
- Add icons to navigation tabs
- Implement proper error handling and loading states
- Add authentication flow management

## Demo Credentials

- Email: `admin@vjn.com`
- Password: (any password works with mock backend)
