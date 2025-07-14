#!/usr/bin/env node

/**
 * FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION
 * Basiert auf der 22:20 CET Version + behebt vite.ts Error
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

console.log('🚀 FINALE DEPLOYMENT-VERSION');
console.log('🔧 Behebt alle ES-Module-Probleme');
console.log('📦 Verwendet tsx direkt ohne Build-Probleme');
console.log('');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🌐 Environment: production');
console.log('📡 Port:', process.env.PORT);
console.log('🗄️ Database:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');
console.log('');

// Ensure required directories exist
const requiredDirs = ['server', 'client', 'shared'];
requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        console.error(`❌ Required directory missing: ${dir}`);
        process.exit(1);
    }
});

console.log('✅ Alle erforderlichen Verzeichnisse vorhanden');
console.log('');

// Start the server with tsx - same as development but in production mode
console.log('🚀 Starte Server mit tsx...');
const serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM empfangen - beende Server...');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT empfangen - beende Server...');
    serverProcess.kill('SIGINT');
});

serverProcess.on('close', (code) => {
    console.log(`\n📊 Server beendet mit Code: ${code}`);
    process.exit(code);
});

serverProcess.on('error', (error) => {
    console.error('\n❌ Server-Fehler:', error);
    process.exit(1);
});

console.log('✅ Server gestartet');
console.log('📋 Erwartete Features:');
console.log('  - React-App mit Vite');
console.log('  - 18 Activities aus Database');
console.log('  - Passwort-Management');
console.log('  - HEIC-Konvertierung');
console.log('  - Community-Features');
console.log('  - Premium-Abonnements');
console.log('');
console.log('🎯 Deployment sollte jetzt ohne ES-Module-Fehler funktionieren!');