#!/bin/bash
# The Common Grounds - Cafe Management Software launcher (macOS/Linux)
cd "$(dirname "$0")/backend" || exit 1

echo "================================================="
echo "  The Common Grounds - Cafe Management Software"
echo "================================================="
echo

if [ ! -d "node_modules/better-sqlite3" ]; then
  echo "First-time setup: installing backend components..."
  npm ci --no-audit --no-fund || { echo "npm install failed. Please install Node.js from https://nodejs.org"; exit 1; }
fi

if [ ! -d "../frontend/node_modules" ]; then
  echo "First-time setup: installing frontend components..."
  (cd ../frontend && npm ci --no-audit --no-fund) || { echo "Frontend npm install failed."; exit 1; }
fi

if [ ! -f "../frontend/dist/index.html" ]; then
  echo "Frontend build is missing. Preparing the frontend..."
  (cd ../frontend && npm run build) || { echo "Frontend build failed."; exit 1; }
fi

if [ ! -f "data/cafe.db" ]; then
  echo "First-time setup: creating the database with default users and sample menu..."
  npm run seed
fi

echo
echo "Starting the server... Keep this terminal open while the cafe is running."
echo "Once it says 'Local access', open that address in your browser."
echo
npm start
