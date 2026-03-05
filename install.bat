@echo off
echo ================================
echo VJN Billing System - Installation
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Backend Setup
echo [SETUP] Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env with your MongoDB URI and JWT Secret
) else (
    echo [OK] .env file already exists
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend installation failed
    pause
    exit /b 1
)

echo [OK] Backend setup complete
echo.

REM Desktop App Setup
echo [SETUP] Setting up Desktop Application...
cd ..\desktop

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
) else (
    echo [OK] .env file already exists
)

echo Installing desktop dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Desktop installation failed
    pause
    exit /b 1
)

echo [OK] Desktop setup complete
echo.

cd ..

echo ================================
echo Installation Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Edit backend\.env with your MongoDB URI
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start desktop: cd desktop ^&^& npm run dev
echo.
echo Documentation:
echo - Quick Start: QUICK_START.md
echo - Quick Reference: DEVELOPER_QUICK_REFERENCE.md
echo - Desktop Guide: desktop\README.md
echo.
echo Happy coding!
pause
