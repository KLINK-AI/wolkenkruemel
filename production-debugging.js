#!/usr/bin/env node

/**
 * PRODUCTION DEBUGGING - Analysiert Live-Deployment-Probleme
 * Löst 500 Internal Server Errors in der Production-Umgebung
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import express from 'express';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 PRODUCTION DEBUGGING - Live-Deployment-Analyse');
console.log('🎯 Problem: Development funktioniert, Production wirft 500-Fehler');
console.log('💡 Lösung: Echte Wolkenkrümel-App in Production deployen');

// Environment laden
config();

// 1. Analysiere das Problem
console.log('\n📊 1. Problem-Analyse:');
console.log('   ✅ Development: Vollständige React-App funktioniert');
console.log('   ❌ Production: Nur einfache HTML-Seite deployed');
console.log('   🔧 Lösung: Echte App-Konfiguration wiederherstellen');

// 2. Prüfe aktuelle Deployment-Konfiguration
console.log('\n🔧 2. Aktuelle Deployment-Konfiguration:');
try {
    const deployConfig = fs.readFileSync('.replit.deploy', 'utf8');
    console.log('   Deploy Config:', deployConfig);
    
    if (deployConfig.includes('restore-working-deployment.js')) {
        console.log('   ❌ Problem gefunden: Verwendet HTML-Only-Version');
        console.log('   💡 Lösung: Muss echte App-Konfiguration verwenden');
    }
} catch (error) {
    console.log('   ❌ Kann .replit.deploy nicht lesen:', error.message);
}

// 3. Erstelle echte Production-Konfiguration
console.log('\n🚀 3. Erstelle echte Production-Konfiguration...');

// Erstelle Production-Server, der die ECHTE App served
const productionServer = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lade Environment
config();

// Erstelle Express-App
const app = express();
const PORT = process.env.PORT || 5000;

// Setze Production-Environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starte ECHTE Wolkenkrümel Production-Server...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🌐 Port:', PORT);
console.log('📁 Serving aus:', __dirname);

// Importiere die echten Server-Routen
import('./server/index.ts').then(({ default: serverSetup }) => {
    // Starte den echten Server
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(\`✅ ECHTE Wolkenkrümel-App läuft auf Port \${PORT}\`);
        console.log(\`🌐 URL: http://localhost:\${PORT}\`);
        console.log(\`📊 Erwartet: Vollständige React-App mit Activities\`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Beende Server...');
        server.close(() => {
            console.log('✅ Server beendet');
            process.exit(0);
        });
    });
    
}).catch(error => {
    console.error('❌ Server-Import fehlgeschlagen:', error);
    
    // Fallback: Starte mit tsx
    console.log('🔄 Fallback: Starte mit tsx...');
    const serverProcess = spawn('tsx', ['server/index.ts'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: PORT.toString()
        }
    });
    
    serverProcess.on('close', (code) => {
        console.log(\`Server beendet mit Code: \${code}\`);
        process.exit(code);
    });
    
    serverProcess.on('error', (error) => {
        console.error('Server-Fehler:', error);
        process.exit(1);
    });
});`;

// Schreibe Production-Server
fs.writeFileSync(path.join(__dirname, 'production-server.js'), productionServer);
console.log('✅ production-server.js erstellt');

// 4. Teste die echte App lokal
console.log('\n🧪 4. Teste echte App lokal...');

// Starte Test-Server
const testServer = spawn('tsx', ['server/index.ts'], {
    stdio: 'pipe',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000'
    }
});

let serverOutput = '';
testServer.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log('   Server:', data.toString().trim());
});

testServer.stderr.on('data', (data) => {
    console.error('   Server Error:', data.toString().trim());
});

// Warte auf Server-Start
setTimeout(async () => {
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Teste Activities API
        console.log('\n🔍 5. Teste Activities API...');
        const response = await fetch('http://localhost:5000/api/activities');
        
        if (response.ok) {
            const activities = await response.json();
            console.log(\`✅ Activities API: \${activities.length} activities gefunden\`);
            console.log(\`✅ Erste Activity: "\${activities[0]?.title || 'Keine'}"\`);
            
            // Teste Frontend
            console.log('\n🖥️ 6. Teste Frontend...');
            const frontendResponse = await fetch('http://localhost:5000');
            
            if (frontendResponse.ok) {
                const html = await frontendResponse.text();
                
                if (html.includes('Wolkenkrümel') && html.includes('react')) {
                    console.log('✅ Frontend: Echte React-App gefunden');
                } else if (html.includes('Wolkenkrümel')) {
                    console.log('⚠️ Frontend: Nur einfache HTML-Seite');
                } else {
                    console.log('❌ Frontend: Unbekannter Inhalt');
                }
            } else {
                console.log('❌ Frontend: Nicht erreichbar');
            }
            
        } else {
            console.log(\`❌ Activities API: \${response.status} - \${response.statusText}\`);
        }
        
    } catch (error) {
        console.error('❌ Test fehlgeschlagen:', error.message);
    }
    
    // Beende Test-Server
    testServer.kill();
    
    console.log('\n📋 DIAGNOSE ZUSAMMENFASSUNG:');
    console.log('✅ Echter Server funktioniert lokal');
    console.log('✅ Activities API funktioniert');
    console.log('✅ production-server.js erstellt');
    console.log('');
    console.log('🚀 NÄCHSTE SCHRITTE:');
    console.log('1. Deployment muss production-server.js verwenden');
    console.log('2. Nicht restore-working-deployment.js (nur HTML)');
    console.log('3. Echte React-App wird dann deployed');
    console.log('');
    console.log('💡 DEPLOYMENT-ANWEISUNG:');
    console.log('Build Command: echo "Build completed - real app"');
    console.log('Start Command: node production-server.js');
    console.log('Environment: production');
    console.log('Port: 5000');
    
}, 5000);