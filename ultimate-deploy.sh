#!/bin/bash

# ULTIMATE DEPLOYMENT SOLUTION - Umgeht alle Replit-Deployment-Probleme
echo "🚀 ULTIMATE DEPLOYMENT SOLUTION - START"

# 1. Cleanup alter Build-Artefakte
echo "🧹 Cleanup alter Build-Artefakte..."
rm -rf dist/ build/ .next/ .vite/ node_modules/.vite/

# 2. Environment zwingend setzen
export NODE_ENV=development
export PORT=${PORT:-5000}

echo "✅ Environment gesetzt:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# 3. Dependencies prüfen
echo "📦 Prüfe Dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# 4. Database Connection testen
echo "🔍 Teste Database Connection..."
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => console.log('✅ Database OK')).catch(e => console.error('❌ Database Error:', e));
"

# 5. Server mit Production-Strategie starten
echo "🚀 Starte Server mit Production-Strategie..."
exec node start-production.js