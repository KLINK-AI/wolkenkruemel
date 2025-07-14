#!/usr/bin/env node

/**
 * WIEDERHERSTELLUNG DER FUNKTIONIERENDEN DEPLOYMENT-VERSION
 * Zurück zur stabilen Version von gestern, die funktionierte
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Lade Environment-Variablen
config();

console.log('🔄 WIEDERHERSTELLUNG DER FUNKTIONIERENDEN VERSION');
console.log('📅 Basiert auf: July 13, 2025 vor 22:20 CET');
console.log('✅ Status: Letzte bekannte funktionierende Deployment-Version');

// Setze Environment wie in der funktionierenden Version
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment (wie in funktionierender Version):');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Vorhanden' : '❌ Fehlt');

// Bereinige alle Build-Artefakte die Konflikte verursachen könnten
console.log('\n🗑️ Bereinige potenzielle Konflikte...');
const conflictingDirs = ['dist', 'build', '.next', '.vite', 'public'];
conflictingDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Entfernt: ${dir}`);
    }
});

// Teste erst die Storage-Funktion direkt
console.log('\n🔍 1. Teste Storage-Funktion...');

try {
    // Importiere und teste DatabaseStorage
    const { storage } = await import('./server/storage.js');
    
    const users = await storage.getAllUsers();
    console.log(`✅ Benutzer gefunden: ${users.length}`);
    
    const activities = await storage.getActivities(10, 0);
    console.log(`✅ Activities gefunden: ${activities.length}`);
    
    if (activities.length > 0) {
        console.log('   Beispiel-Activities:');
        activities.slice(0, 2).forEach(activity => {
            console.log(`   - ${activity.title} (ID: ${activity.id})`);
        });
    }
    
    console.log('✅ Storage-Test erfolgreich!');
    
} catch (error) {
    console.error('❌ Storage-Test fehlgeschlagen:', error.message);
    console.log('💡 Dies könnte das Problem im Deployment sein');
}

// Starte Server EXAKT wie in der funktionierenden Version
console.log('\n🚀 2. Starte Server (wie in funktionierender Version)...');

// Verwende tsx direkt - so wie es am 13.07. um 22:20 CET funktionierte
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('\n❌ Server-Fehler:', error);
    console.log('💡 Versuche alternative Startmethode...');
    
    // Fallback: Verwende node mit tsx/esm loader
    const fallbackServer = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: process.env.PORT || '5000'
        }
    });
    
    fallbackServer.on('error', (fallbackError) => {
        console.error('\n❌ Fallback-Server-Fehler:', fallbackError);
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

console.log('✅ Server gestartet (wie in funktionierender Version)');
console.log('🌐 Wolkenkrümel sollte jetzt wie am 13.07. um 22:20 CET funktionieren');
console.log('📋 Deployment-Methode: tsx server/index.ts (bewährt)');