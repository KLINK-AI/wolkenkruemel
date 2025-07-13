#!/bin/bash

# Build script for production deployment
echo "Starting production build..."

# Clean previous builds
rm -rf dist/
mkdir -p dist/public

# Build frontend (if needed, otherwise use static files)
echo "Building frontend..."
npm run build || {
    echo "Frontend build failed, using fallback..."
    echo '<!DOCTYPE html><html><head><title>Wolkenkrümel</title></head><body><div id="root">Loading...</div><script>window.location.href="/activities";</script></body></html>' > dist/public/index.html
}

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Start production server
echo "Starting production server..."
NODE_ENV=production node dist/index.js