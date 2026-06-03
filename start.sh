#!/usr/bin/env bash
# Engineering Resource Planner — macOS / Linux launcher

set -e
cd "$(dirname "$0")"

echo ""
echo " ============================================"
echo "  Engineering Resource Planner"
echo " ============================================"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo " ERROR: Node.js is not installed."
  echo " Download from: https://nodejs.org"
  exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
  echo " Installing dependencies (first run only)..."
  npm install --prefer-offline
  echo ""
fi

# Build app if dist/ is missing
if [ ! -f "dist/index.html" ]; then
  echo " Building app (first run only)..."
  npm run build
  echo ""
fi

# Seed data
if [ ! -f "data/plan.json" ]; then
  echo " Initialising plan data from seed..."
  if [ -f "data/plan.seed.json" ]; then
    cp "data/plan.seed.json" "data/plan.json"
  fi
  echo ""
fi

echo " Starting server..."
echo " (Leave this terminal open while using the app)"
echo ""
node server/index.js
