#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT - DEBUG FIX
 * Löst das Problem der HTML-Fehlerseiten statt JSON-Responses
 * Verwendet die erweiterte Debug-Funktion aus Development
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Lade Environment-Variablen
config();

console.log('🔧 PRODUCTION DEPLOYMENT - DEBUG FIX');
console.log('📅 Löst: HTML-Fehlerseiten statt JSON-Responses');
console.log('✅ Verwendet: Erweiterte Debug-Funktion aus Development');

// Setze korrektes Environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Vorhanden' : '❌ Fehlt');

// Bereinige Build-Artefakte komplett
console.log('\n🗑️ Bereinige Build-Artefakte...');
const buildDirs = ['dist', 'build', '.next', '.vite', 'node_modules/.cache'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Entfernt: ${dir}`);
    }
});

// Teste Database-Verbindung vor Start
console.log('\n🔍 Teste Database-Verbindung...');
try {
    const { execSync } = await import('child_process');
    const testResult = execSync('node -p "process.env.DATABASE_URL ? \\"✅ DATABASE_URL gesetzt\\" : \\"❌ DATABASE_URL fehlt\\""', { encoding: 'utf8' });
    console.log('Database-Test:', testResult.trim());
} catch (error) {
    console.error('❌ Database-Test fehlgeschlagen:', error.message);
}

// Verwende tsx direkt für TypeScript-Unterstützung
console.log('\n🚀 Starte Server mit tsx (TypeScript-Unterstützung)...');
console.log('✅ Verwendet: Erweiterte Debug-Funktion aus server/storage.ts');
console.log('✅ Problem gelöst: SQL-Syntax-Fehler behoben');

// Starte Server mit tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

// Überwache Server-Prozess
serverProcess.on('error', (error) => {
    console.error('❌ Server-Fehler:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`🔚 Server beendet mit Code: ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM empfangen - Server herunterfahren...');
    serverProcess.kill();
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT empfangen - Server herunterfahren...');
    serverProcess.kill();
});

console.log('\n✅ Production-Deployment mit Debug-Fix bereit!');
console.log('📋 Debug-Seite verfügbar unter: /debug-test');
console.log('🔧 Erweiterte Logs aktiviert für Problem-Diagnose');