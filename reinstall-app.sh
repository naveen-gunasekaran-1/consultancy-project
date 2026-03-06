#!/bin/bash

echo "🧹 Cleaning up old app installation..."

# Force quit any running instances
pkill -9 "VJN Billing System" 2>/dev/null
echo "✓ Killed any running instances"

# Wait a moment for processes to fully exit
sleep 2

# Delete the old app completely
if [ -d "/Applications/VJN Billing System.app" ]; then
    rm -rf "/Applications/VJN Billing System.app"
    echo "✓ Removed old app from Applications"
else
    echo "ℹ No old app found in Applications"
fi

# Optional: Clear app data (database will be recreated)
read -p "❓ Do you want to clear app data (database)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf ~/Library/Application\ Support/VJN\ Billing\ System
    echo "✓ Cleared app data"
else
    echo "ℹ Keeping app data"
fi

# Remove old log file
rm -f ~/Library/Application\ Support/VJN-app-debug.log
echo "✓ Removed old debug log"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📦 Now opening the new DMG installer..."
open "$(dirname "$0")/desktop/dist/VJN Billing System-1.0.0-arm64.dmg"

echo ""
echo "👉 Next steps:"
echo "   1. Drag the app to Applications folder"
echo "   2. Launch VJN Billing System from Applications"
echo "   3. Try logging in with: admin@vjn.com / admin123"
echo ""
echo "📋 If it still fails, check the debug log:"
echo "   cat ~/Library/Application\ Support/VJN-app-debug.log"
