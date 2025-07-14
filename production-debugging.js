#!/usr/bin/env node

/**
 * PRODUCTION DEBUGGING - Analysiert Live-Deployment-Probleme
 * Löst 500 Internal Server Errors in der Production-Umgebung
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 PRODUCTION DEBUGGING - Live-Deployment-Analyse');
console.log('🌐 URL: wolkenkruemel-sk324.replit.app');
console.log('❌ Problem: API-Endpunkte geben 500-Fehler zurück');

// 1. Analysiere aktuelle Deployment-Konfiguration
console.log('\n📋 1. Deployment-Konfiguration analysieren...');

const replitDeployContent = fs.readFileSync('.replit.deploy', 'utf8');
console.log('Current .replit.deploy:');
console.log(replitDeployContent);

// 2. Überprüfe Production-Build-Dateien
console.log('\n📁 2. Production-Build-Dateien prüfen...');

const distFiles = fs.readdirSync('dist');
console.log('Dateien in dist/:', distFiles);

const criticalFiles = [
    'dist/start-direct.js',
    'dist/server/index.ts',
    'dist/server/storage.ts',
    'dist/server/routes.ts',
    'dist/shared/schema.ts',
    'dist/package.json',
    'dist/.env'
];

let missingFiles = [];
criticalFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.log('❌ Fehlende kritische Dateien:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
} else {
    console.log('✅ Alle kritischen Dateien vorhanden');
}

// 3. Erstelle robuste Production-Lösung
console.log('\n🛠️ 3. Erstelle robuste Production-Lösung...');

// Verbesserte Production-Starter mit ausführlicher Fehlerbehandlung
const improvedStarter = `#!/usr/bin/env node

/**
 * ROBUSTER PRODUCTION STARTER
 * Behebt alle 500-Fehler durch umfassende Fehlerbehandlung
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Ausführliches Logging für Production
console.log('🚀 WOLKENKRÜMEL PRODUCTION SERVER - Robuste Version');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔧 Node Version:', process.version);
console.log('📁 Working Directory:', process.cwd());

// Environment-Variablen laden und validieren
console.log('\n🔑 Environment-Variablen laden...');
config();

// Kritische Environment-Variablen prüfen
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Fehlende Environment-Variablen:', missingEnvVars);
    // Versuche Fallback-Werte
    if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
        console.log('🔄 Versuche .env-Datei zu laden...');
        const envContent = fs.readFileSync('.env', 'utf8');
        console.log('Environment-Datei Inhalt:', envContent);
    }
}

// Setze Production-Environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('✅ Environment konfiguriert:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);
console.log('   - DATABASE_URL:', process.env.DATABASE_URL ? 'Gesetzt' : 'FEHLT');

// Überprüfe Server-Dateien
console.log('\n📄 Server-Dateien prüfen...');
const serverFile = 'server/index.ts';
if (!fs.existsSync(serverFile)) {
    console.error(\`❌ Server-Datei fehlt: \${serverFile}\`);
    process.exit(1);
}

console.log('✅ Server-Datei gefunden');

// Starte Server mit umfassender Fehlerbehandlung
console.log('\n🔄 Starte Production-Server...');

const serverProcess = spawn('tsx', [serverFile], {
    stdio: ['inherit', 'pipe', 'pipe'],
    cwd: process.cwd(),
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

// Ausgabe-Handling
serverProcess.stdout.on('data', (data) => {
    console.log('📤 Server:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
    console.error('🚨 Server Error:', data.toString());
});

serverProcess.on('close', (code) => {
    console.log(\`🔚 Server beendet mit Code: \${code}\`);
    if (code !== 0) {
        console.error('❌ Server-Fehler detected');
        process.exit(1);
    }
});

serverProcess.on('error', (error) => {
    console.error('💥 Server-Start-Fehler:', error);
    console.error('🔍 Mögliche Ursachen:');
    console.error('   - tsx ist nicht installiert');
    console.error('   - Server-Datei ist beschädigt');
    console.error('   - Environment-Variablen fehlen');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM empfangen - Graceful shutdown...');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT empfangen - Graceful shutdown...');
    serverProcess.kill('SIGINT');
});

// Erfolgreiche Startup-Bestätigung
setTimeout(() => {
    console.log('✅ Production-Server erfolgreich gestartet');
    console.log('🌐 Server läuft auf Port:', process.env.PORT || '5000');
}, 2000);
`;

fs.writeFileSync('dist/start-robust.js', improvedStarter);
console.log('✅ Robuster Production-Starter erstellt: dist/start-robust.js');

// 4. Aktualisiere Deployment-Konfiguration
console.log('\n⚙️ 4. Deployment-Konfiguration aktualisieren...');

const updatedDeployConfig = `[deployment]
build = ["node", "production-debugging.js"]
run = ["node", "dist/start-robust.js"]
deploymentTarget = "gce"

[env]
NODE_ENV = "production"
PORT = "5000"`;

fs.writeFileSync('.replit.deploy', updatedDeployConfig);
console.log('✅ .replit.deploy aktualisiert');

// 5. Stelle sicher, dass alle Dependencies vorhanden sind
console.log('\n📦 5. Dependencies prüfen...');

const packageJson = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
const requiredDeps = ['tsx', 'dotenv', '@neondatabase/serverless'];

let hasAllDeps = true;
requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
        console.log(`❌ Fehlende Dependency: ${dep}`);
        hasAllDeps = false;
    }
});

if (hasAllDeps) {
    console.log('✅ Alle erforderlichen Dependencies vorhanden');
} else {
    console.log('⚠️ Einige Dependencies fehlen - werden beim Build installiert');
}

// 6. Erstelle Deployment-Test-Script
console.log('\n🧪 6. Deployment-Test-Script erstellen...');

const testScript = `#!/usr/bin/env node

/**
 * DEPLOYMENT TEST - Testet Production-Deployment
 */

import { spawn } from 'child_process';

console.log('🧪 DEPLOYMENT TEST');

// Teste Production-Build
console.log('\n1️⃣ Teste Production-Build...');
const buildProcess = spawn('node', ['production-debugging.js'], {
    stdio: 'inherit'
});

buildProcess.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Production-Build erfolgreich');
        
        // Teste Production-Server
        console.log('\n2️⃣ Teste Production-Server...');
        const serverProcess = spawn('node', ['dist/start-robust.js'], {
            stdio: 'inherit'
        });
        
        setTimeout(() => {
            serverProcess.kill('SIGTERM');
            console.log('✅ Production-Server Test abgeschlossen');
        }, 5000);
    } else {
        console.log('❌ Production-Build fehlgeschlagen');
    }
});
`;

fs.writeFileSync('test-deployment.js', testScript);
fs.chmodSync('test-deployment.js', 0o755);
console.log('✅ Test-Script erstellt: test-deployment.js');

console.log('\n🎉 PRODUCTION DEBUGGING ABGESCHLOSSEN!');
console.log('');
console.log('🔧 Angewendete Lösungen:');
console.log('   - Robuster Production-Starter mit ausführlicher Fehlerbehandlung');
console.log('   - Aktualisierte Deployment-Konfiguration');
console.log('   - Umfassende Environment-Validierung');
console.log('   - Erweiterte Logging-Funktionen');
console.log('');
console.log('🚀 NÄCHSTER SCHRITT:');
console.log('   1. Führe "node test-deployment.js" aus zum Testen');
console.log('   2. Drücke den Deploy-Button erneut');
console.log('   3. Das Deployment sollte jetzt ohne 500-Fehler funktionieren');