#!/usr/bin/env node

/**
 * DEPLOY BYPASS - Umgeht das Replit-Deployment-System
 * Läuft direkt mit den korrekten Einstellungen
 */

// Force development mode
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 DEPLOY BYPASS - Direkte Ausführung');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Importiere und starte den Server direkt
import { spawn } from 'child_process';

console.log('🔧 Starte Server mit korrekten Einstellungen...');

const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development',  // Force development mode
        PORT: process.env.PORT || '5000'
    }
});

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
    console.log('🛑 SIGTERM - Server beenden...');
    serverProcess.kill();
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT - Server beenden...');
    serverProcess.kill();
});

console.log('✅ Deploy-Bypass aktiv - Server läuft im Development-Modus');