#!/bin/bash
export NODE_ENV=production
export PORT=5000
echo "🚀 Starte Production Server..."
echo "📍 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"
tsx server/index.ts
