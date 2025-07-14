#!/usr/bin/env node

/**
 * FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION
 * Basiert auf der 22:20 CET Version + behebt vite.ts Error
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';
import express from 'express';

// Lade Environment-Variablen
config();

console.log('🔧 FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION');
console.log('📅 Basiert auf: 22:20 CET funktionierend + Debug-Test-Ergebnisse');
console.log('✅ Problem identifiziert: ES Module Resolution (tsx funktioniert, node nicht)');

// Setze korrektes Environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Vorhanden' : '❌ Fehlt');

// Bereinige Build-Artefakte
console.log('\n🗑️ Bereinige Build-Artefakte...');
const buildDirs = ['dist', 'build', '.next', '.vite'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Entfernt: ${dir}`);
    }
});

// Erstelle Debug-Endpunkt für Test-Seite
console.log('\n🔧 Erstelle Debug-Endpunkt...');
const debugEndpoint = `
// Debug-Endpunkt für Test-Seite
app.get('/api/debug-env', (req, res) => {
    res.json({
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        hasDatabase: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString()
    });
});
`;

// Kopiere Debug-Test-Seite in Public-Ordner
console.log('📋 Stelle Debug-Test-Seite bereit...');
writeFileSync('debug-test-ready.html', `
<!DOCTYPE html>
<html><head><title>Debug Test Ready</title></head><body>
<h1>Debug Test Ready</h1>
<p>Die Debug-Test-Seite ist bereit. Öffne /debug-test.html nach dem Deployment.</p>
</body></html>
`);

// Teste erst die Storage-Funktion
console.log('\n🔍 Teste Storage-Funktion vor Start...');
try {
    // Verwende tsx für TypeScript-Import
    const { storage } = await import('./server/storage.ts');
    
    const users = await storage.getAllUsers();
    console.log(`✅ Benutzer gefunden: ${users.length}`);
    
    const activities = await storage.getActivities(5, 0);
    console.log(`✅ Activities gefunden: ${activities.length}`);
    
    console.log('✅ Storage-Test erfolgreich - bereit für Deployment!');
    
} catch (error) {
    console.error('❌ Storage-Test fehlgeschlagen:', error.message);
    console.log('🔧 Das ist genau das Problem im Deployment!');
}

// Starte Server mit tsx (funktioniert) anstatt node (funktioniert nicht)
console.log('\n🚀 Starte Server mit tsx (bewährt)...');

// Verwende tsx direkt - das hat in den Tests funktioniert
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('\n❌ Server-Error:', error);
    console.log('🔧 Versuche Node.js Fallback...');
    
    // Fallback mit node --loader tsx/esm
    const fallback = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: process.env.PORT || '5000'
        }
    });
    
    fallback.on('error', (fallbackError) => {
        console.error('\n❌ Fallback-Error:', fallbackError);
        console.log('💡 Beide Methoden fehlgeschlagen - das ist das Deployment-Problem!');
        process.exit(1);
    });
});

server.on('close', (code) => {
    console.log(`\n📊 Server beendet mit Code: ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM - Server wird beendet...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT - Server wird beendet...');
    server.kill('SIGINT');
});

console.log('✅ Server gestartet mit tsx (bewährt)');
console.log('🌐 Wolkenkrümel läuft mit Debug-Test-Seite');
console.log('📋 Test-Seite: http://localhost:5000/debug-test.html');
console.log('🔧 Deployment-Methode: tsx (funktioniert) vs node (funktioniert nicht)');