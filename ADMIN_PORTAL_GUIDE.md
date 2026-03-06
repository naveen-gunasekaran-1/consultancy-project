# Admin Portal and Update Delivery Guide

This guide explains how to access the admin portal and deliver new desktop app updates for VJN Way To Success.

## 1. Admin Portal Access

The desktop app uses the same login screen for all users. Admin access depends on the user role in backend data.

### Default Admin Account

Seed the default admin user from the backend folder:

```bash
cd backend
npm run seed:admin
```

Default credentials:

- Email: `admin@vjn.com`
- Password: `admin123`

After first login, change the password immediately.

### Login Steps

1. Start backend server.
2. Start desktop app.
3. Login using admin credentials on the login screen.
4. You will be routed to the dashboard and can access all modules from the sidebar.

## 2. Run the System for Admin Use

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

Default backend URL expected by desktop app:

- `http://localhost:5002/api`

### Desktop

```bash
cd desktop
npm install
npm run dev
```

## 3. Deliver New Updates (Desktop Build)

From the desktop folder:

```bash
cd desktop
npm run build
```

This command:

1. Builds the React frontend.
2. Packages Electron app installers via `electron-builder`.

Build outputs are generated in:

- `desktop/dist/`

Common output files on macOS:

- `VJN Billing System-<version>-arm64.dmg`
- `VJN Billing System-<version>-arm64-mac.zip`

Share the `.dmg` (or `.zip`) with users for installation/update.

## 4. Recommended Update Workflow

1. Pull latest source code.
2. Update version in `desktop/package.json`.
3. Build backend and desktop.
4. Smoke-test login, invoices, payments, clients, workers.
5. Generate installer with `npm run build` in `desktop`.
6. Deliver installer and release notes.

## 5. Quick Troubleshooting

### Admin login fails

- Ensure backend is running.
- Re-run `npm run seed:admin` in `backend`.
- Confirm `authToken` is not stale in local storage (logout and login again).

### Desktop cannot reach backend

- Ensure backend is running on port `5002`.
- Check `REACT_APP_API_URL` in desktop environment if using a custom URL.

### Build succeeds but app fails at runtime

- Rebuild backend first: `cd backend && npm run build`.
- Rebuild desktop: `cd desktop && npm run build`.
- Ensure packaged app includes `backend/dist` and backend dependencies.
