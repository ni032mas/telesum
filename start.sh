#!/bin/bash

# Telesum — quick start script
# Installs dependencies, builds the project, starts the server and opens the browser.

set -e

PORT=3001
URL="http://localhost:$PORT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${GREEN}=== Telesum — Telegram Chat Summary ===${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js not found!${NC}"
  echo ""
  echo "Install Node.js from: https://nodejs.org/"
  echo "Or via Homebrew (macOS): brew install node"
  echo ""
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Node.js 18+ is required. Current version: $(node -v)${NC}"
  echo "Download the latest version from: https://nodejs.org/"
  exit 1
fi

echo -e "Node.js: $(node -v) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm not found! It should come with Node.js.${NC}"
  exit 1
fi

echo -e "npm: $(npm -v) ✓"

# Check LLM CLI
LLM_FOUND=""
for cli in claude gemini qwen; do
  if command -v $cli &> /dev/null; then
    LLM_FOUND="$LLM_FOUND $cli"
  fi
done

if [ -z "$LLM_FOUND" ]; then
  echo ""
  echo -e "${YELLOW}Warning: No LLM CLI found (claude, gemini, or qwen).${NC}"
  echo "You need at least one to generate summaries."
  echo "See README.md for installation instructions."
  echo ""
else
  echo -e "LLM CLI:$LLM_FOUND ✓"
fi

echo ""

# Install dependencies
if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo ""
fi

# Build
echo -e "${YELLOW}Building the project...${NC}"
npm run build
echo ""

# Start server
echo -e "${GREEN}Starting Telesum on ${URL}${NC}"
echo -e "Press Ctrl+C to stop."
echo ""

# Open browser after a short delay
(sleep 2 && open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || start "$URL" 2>/dev/null || true) &

# Run the server
npm start
