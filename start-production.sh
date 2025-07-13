#!/bin/bash

# Production start script
echo "Starting Wolkenkrümel production server..."

# Set environment variables
export NODE_ENV=production

# Ensure dist directory exists
mkdir -p dist/public

# Start the server
node dist/index.js