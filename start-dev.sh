#!/bin/bash

# VJN Billing System - Development Launcher
# This script starts both backend and desktop applications

echo "🚀 Starting VJN Billing System..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${YELLOW}📊 Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not detected. Make sure it's running!${NC}"
    echo "   Start MongoDB with: brew services start mongodb-community"
    echo ""
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}🔧 Starting Backend Server (Port 5000)...${NC}"
cd "$SCRIPT_DIR/backend"
npm run dev > /tmp/vjn-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "   Waiting for backend..."
sleep 3

echo ""
echo -e "${BLUE}🖥️  Starting Desktop Application (Port 3000)...${NC}"
cd "$SCRIPT_DIR/desktop"
npm start > /tmp/vjn-desktop.log 2>&1 &
DESKTOP_PID=$!
echo "   Desktop PID: $DESKTOP_PID"

echo ""
echo -e "${GREEN}✅ Applications starting!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📱 Desktop App${NC} will open automatically"
echo -e "${BLUE}🔌 Backend API${NC}: http://localhost:5000"
echo -e "${BLUE}🌐 React Dev${NC}:  http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "   Backend: tail -f /tmp/vjn-backend.log"
echo "   Desktop: tail -f /tmp/vjn-desktop.log"
echo ""
echo "⏹️  To stop:"
echo "   kill $BACKEND_PID $DESKTOP_PID"
echo "   Or press Ctrl+C in this terminal"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Waiting for servers to start (this takes ~30 seconds)..."

# Wait and monitor
wait
