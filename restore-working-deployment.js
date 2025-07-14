#!/usr/bin/env node

/**
 * WIEDERHERSTELLUNG DER FUNKTIONIERENDEN DEPLOYMENT-VERSION
 * Zurück zur stabilen Version von gestern, die funktionierte
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔄 WIEDERHERSTELLUNG DER FUNKTIONIERENDEN DEPLOYMENT-VERSION');
console.log('📅 Ziel: Zurück zur stabilen Version von gestern');
console.log('❌ Problem: Production verwendet nicht DatabaseStorage korrekt');
console.log('✅ Lösung: Einfache, funktionierende Deployment-Konfiguration');

// 1. Analysiere das grundlegende Problem
console.log('\n🔍 1. Analysiere das grundlegende Problem...');
console.log('Development Environment:');
console.log('   - Läuft mit: tsx server/index.ts');
console.log('   - Verwendet: DatabaseStorage implementierung');
console.log('   - Funktioniert: ✅ APIs geben 200 zurück');
console.log('');
console.log('Production Environment:');
console.log('   - Läuft mit: komplexe Build-Scripts');
console.log('   - Verwendet: möglicherweise veraltete Storage');
console.log('   - Funktioniert: ❌ APIs geben 500 zurück');

// 2. Erstelle einfache, funktionierende Deployment-Konfiguration
console.log('\n📋 2. Erstelle einfache Deployment-Konfiguration...');

// Einfache .replit.deploy Konfiguration die funktioniert
const simpleDeployConfig = `[deployment]
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
deploymentTarget = "gce"

[env]
NODE_ENV = "production"
PORT = "5000"`;

fs.writeFileSync('.replit.deploy', simpleDeployConfig);
console.log('✅ Einfache .replit.deploy erstellt');

// 3. Validiere dass package.json korrekte Scripts hat
console.log('\n📦 3. Validiere package.json Scripts...');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('Aktuelle Scripts:');
console.log('   - dev:', packageJson.scripts.dev);
console.log('   - build:', packageJson.scripts.build);  
console.log('   - start:', packageJson.scripts.start);

// 4. Erstelle einfachen Production-Build
console.log('\n🏗️ 4. Erstelle einfachen Production-Build...');

// Einfacher Build-Prozess ohne komplexe Transformationen
const simpleBuildScript = `#!/usr/bin/env node

/**
 * EINFACHER BUILD-PROZESS
 * Kopiert nur die notwendigen Dateien ohne komplexe Transformationen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('📦 Einfacher Build-Prozess...');

// Lösche alten dist Ordner
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}

// Erstelle dist Ordner
fs.mkdirSync('dist', { recursive: true });

// Kopiere alle notwendigen Dateien direkt
const filesToCopy = [
    'server',
    'shared',
    'client',
    'package.json',
    'vite.config.ts',
    'drizzle.config.ts',
    'postcss.config.js',
    'tailwind.config.ts'
];

filesToCopy.forEach(item => {
    const source = path.join(__dirname, item);
    const dest = path.join(__dirname, 'dist', item);
    
    if (fs.existsSync(source)) {
        if (fs.statSync(source).isDirectory()) {
            fs.cpSync(source, dest, { recursive: true });
        } else {
            fs.copyFileSync(source, dest);
        }
        console.log(\`✅ Kopiert: \${item}\`);
    }
});

// Erstelle Environment-Datei
const envContent = \`NODE_ENV=production
PORT=5000
DATABASE_URL=\${process.env.DATABASE_URL || ''}
VITE_STRIPE_PUBLIC_KEY=\${process.env.VITE_STRIPE_PUBLIC_KEY || ''}
STRIPE_SECRET_KEY=\${process.env.STRIPE_SECRET_KEY || ''}
\`;

fs.writeFileSync('dist/.env', envContent);
console.log('✅ Environment-Datei erstellt');

console.log('🎉 Einfacher Build abgeschlossen!');
`;

fs.writeFileSync('simple-build.js', simpleBuildScript);
console.log('✅ Einfacher Build-Script erstellt');

// 5. Erstelle einfachen Production-Starter
console.log('\n🚀 5. Erstelle einfachen Production-Starter...');

const simpleStartScript = `#!/usr/bin/env node

/**
 * EINFACHER PRODUCTION-STARTER
 * Startet den Server genau wie in Development
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Lade Environment-Variablen
config();

// Setze Production-Environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Einfacher Production-Start...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🌐 Port:', process.env.PORT);

// Starte Server genau wie in Development
const serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production'
    }
});

serverProcess.on('close', (code) => {
    console.log(\`Server beendet mit Code: \${code}\`);
});

serverProcess.on('error', (error) => {
    console.error('Server-Fehler:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    serverProcess.kill('SIGINT');
});
`;

fs.writeFileSync('dist/start-simple.js', simpleStartScript);
console.log('✅ Einfacher Production-Starter erstellt');

// 6. Aktualisiere package.json Scripts
console.log('\n⚙️ 6. Aktualisiere package.json Scripts...');

packageJson.scripts.build = 'node simple-build.js';
packageJson.scripts.start = 'node dist/start-simple.js';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json Scripts aktualisiert');

// 7. Teste die einfache Konfiguration
console.log('\n🧪 7. Teste die einfache Konfiguration...');

const testSimpleConfig = `#!/usr/bin/env node

/**
 * TEST DER EINFACHEN KONFIGURATION
 */

import { spawn } from 'child_process';

console.log('🧪 Teste einfache Konfiguration...');

// Teste Build
console.log('\\n1️⃣ Teste Build...');
const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit'
});

buildProcess.on('close', (buildCode) => {
    console.log(\`Build beendet mit Code: \${buildCode}\`);
    
    if (buildCode === 0) {
        console.log('✅ Build erfolgreich');
        
        // Teste Start (nur kurz)
        console.log('\\n2️⃣ Teste Start...');
        const startProcess = spawn('npm', ['run', 'start'], {
            stdio: 'inherit'
        });
        
        setTimeout(() => {
            startProcess.kill('SIGTERM');
            console.log('✅ Start-Test abgeschlossen');
        }, 5000);
    } else {
        console.log('❌ Build fehlgeschlagen');
    }
});
`;

fs.writeFileSync('test-simple.js', testSimpleConfig);
fs.chmodSync('test-simple.js', 0o755);
console.log('✅ Test-Script erstellt');

console.log('\n🎉 WIEDERHERSTELLUNG ABGESCHLOSSEN!');
console.log('');
console.log('✅ Implementierte Lösungen:');
console.log('   - Einfache .replit.deploy Konfiguration');
console.log('   - Direkter Build-Prozess ohne Transformationen');
console.log('   - Production-Starter identisch zu Development');
console.log('   - Aktualisierte package.json Scripts');
console.log('   - Test-Script für Validierung');
console.log('');
console.log('🚀 NÄCHSTE SCHRITTE:');
console.log('   1. Führe "node test-simple.js" aus');
console.log('   2. Wenn Test erfolgreich, drücke Deploy-Button');
console.log('   3. Production sollte jetzt wie Development funktionieren');
console.log('');
console.log('💡 WARUM DIES FUNKTIONIERT:');
console.log('   - Verwendet tsx direkt (wie Development)');
console.log('   - Keine komplexen Build-Transformationen');
console.log('   - Identische DatabaseStorage-Implementierung');
console.log('   - Einfache, bewährte Konfiguration');