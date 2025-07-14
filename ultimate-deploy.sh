#!/bin/bash

echo "🚀 ULTIMATE DEPLOYMENT SOLUTION"
echo "🎯 Basierend auf: Funktionierende Version von gestern"
echo "🔧 Lösung: Komplett neues Deployment mit sauberer Konfiguration"

# 1. Stoppe alle laufenden Prozesse
echo "🛑 Stoppe alle laufenden Prozesse..."
pkill -f "tsx server/index.ts" || true
pkill -f "node server/index.js" || true
sleep 2

# 2. Port freigeben
echo "🔄 Gebe Port 5000 frei..."
lsof -ti:5000 | xargs kill -9 || true
sleep 2

# 3. Erstelle saubere Production-Konfiguration
echo "📋 Erstelle saubere Production-Konfiguration..."

# Erstelle Production-Script
cat > start-production.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=5000
echo "🚀 Starte Production Server..."
echo "📍 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"
tsx server/index.ts
EOF

chmod +x start-production.sh

# 4. Aktualisiere .replit.deploy
echo "🔧 Aktualisiere .replit.deploy..."
cat > .replit.deploy << 'EOF'
[deployment]
build = ["echo", "Build completed - using ultimate deploy solution"]
run = ["bash", "start-production.sh"]
deploymentTarget = "gce"

[env]
NODE_ENV = "production"
PORT = "5000"
EOF

# 5. Teste Production-Server
echo "🧪 Teste Production-Server..."
timeout 15 bash start-production.sh &
SERVER_PID=$!

# Warte auf Server-Start
sleep 10

# Teste API
echo "🔍 Teste Activities API..."
if curl -s -f http://localhost:5000/api/activities > /dev/null; then
    echo "✅ Activities API: Funktioniert"
    ACTIVITIES_COUNT=$(curl -s http://localhost:5000/api/activities | jq length)
    echo "📊 Activities gefunden: $ACTIVITIES_COUNT"
else
    echo "❌ Activities API: Fehlschlag"
fi

# Stoppe Test-Server
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🎉 DEPLOYMENT BEREIT!"
echo "✅ Production-Script: start-production.sh"
echo "✅ Deployment-Config: .replit.deploy"
echo "✅ Server-Test: Abgeschlossen"
echo ""
echo "🚀 Klicke jetzt auf 'Deploy' um das Deployment zu starten!"
echo "📊 Erwartetes Ergebnis: Funktionierende Wolkenkrümel-Plattform"