# Deployment Logs für Replit Support

## Deployment-Problem-Zusammenfassung
- **Projekt**: Wolkenkrümel (TypeScript/React/Express/PostgreSQL)
- **Problem**: Alle Deployments führen zu "Internal Server Error"
- **Development**: Funktioniert perfekt (alle Features arbeiten)
- **Getestete Deployment-Strategien**: 15+ verschiedene Ansätze

## Aktuelle .replit.deploy Konfiguration
```
[deployment]
build = ["echo", "Using development server directly"]
run = ["node", "deployment-force-vite.js"]
deploymentTarget = "gce"

[env]
NODE_ENV = "development"
PORT = "5000"
```

## Deployment-Versuch-History (Chronologisch)

### 1. Standard npm run build + npm run start
- **Fehler**: ES module import failures
- **Error**: "Cannot find module '/server/storage.js'"

### 2. Direct tsx execution
- **Konfiguration**: `run = ["tsx", "server/index.ts"]`
- **Fehler**: Build timeouts, PORT conflicts

### 3. Force development mode
- **Konfiguration**: `NODE_ENV = "development"`
- **Fehler**: Replit überschreibt auf production

### 4. Bypass build process
- **Konfiguration**: `build = ["echo", "No build needed"]`
- **Fehler**: serveStatic() ohne built files

### 5. Multiple deployment scripts
- **Dateien**: production-deployment-final.js, simple-deployment.js, etc.
- **Fehler**: Alle führen zu Internal Server Error

## Aktuelle Deployment-Logs (Letzte Versuche)

### Browser-Fehler
```
Internal Server Error
```

### Console-Fehler (aus Debug-Tool)
```
Activities API fehlgeschlagen: 500
Raw Error: ...
Activities Direct API Fehler: Unexpected token '<', "<!DOCTYPE..." is not valid JSON
```

### Environment-Status (Production)
```
NODE_ENV: production
PORT: 5000
Database: Connected
Timestamp: 2025-07-14T19:03:24.579Z
```

## Technische Details

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **Build**: esbuild + Vite

### Development vs Production
- **Development**: setupVite() → React app lädt korrekt
- **Production**: serveStatic() → Fehlt built files → HTML error pages

### Root Cause Analysis
1. **ES Module Issues**: Drizzle-ORM imports fehlschlagen in production
2. **Build Process**: Vite build + esbuild bundling führt zu Konflikten
3. **Environment Detection**: app.get("env") !== NODE_ENV in Replit

## Bestätigte Funktionierende Features (Development)
- ✅ 18 Activities aus PostgreSQL
- ✅ 6 Users mit Authentifizierung
- ✅ Community Posts mit Kommentaren
- ✅ Premium Subscriptions (Stripe)
- ✅ HEIC Image Conversion
- ✅ Password Management
- ✅ Alle APIs return JSON (200 status)

## Deployment-Änderungen bestätigt
- **Ja**, .replit.deploy wurde mehrfach geändert
- **Ja**, nach jeder Änderung wurde redeploy durchgeführt
- **Ja**, verschiedene run-Kommandos getestet
- **Ja**, verschiedene build-Strategien getestet

## Nächste Schritte
Support-Team soll prüfen:
1. Warum ES module imports in production fehlschlagen
2. Warum NODE_ENV=development in .replit.deploy überschrieben wird
3. Warum serveStatic() HTML-Fehlerseiten statt JSON-APIs liefert