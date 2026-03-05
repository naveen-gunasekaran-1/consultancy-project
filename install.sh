#!/bin/bash

echo "🚀 VJN Billing System - Installation Script"
echo "============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your MongoDB URI and JWT Secret"
else
    echo "✅ .env file already exists"
fi

echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

echo "✅ Backend setup complete"
echo ""

# Desktop App Setup
echo "💻 Setting up Desktop Application..."
cd ../desktop

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
else
    echo "✅ .env file already exists"
fi

echo "Installing desktop dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Desktop installation failed"
    exit 1
fi

echo "✅ Desktop setup complete"
echo ""

# Summary
cd ..
echo "============================================="
echo "✅ Installation Complete!"
echo "============================================="
echo ""
echo "📝 Next Steps:"
echo "1. Edit backend/.env with your MongoDB URI"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start desktop: cd desktop && npm run dev"
echo ""
echo "📚 Documentation:"
echo "- Quick Start: QUICK_START.md"
echo "- Quick Reference: DEVELOPER_QUICK_REFERENCE.md"
echo "- Desktop Guide: desktop/README.md"
echo ""
echo "🎉 Happy coding!"
