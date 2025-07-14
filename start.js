#!/usr/bin/env node

/**
 * ULTIMATIVE DEPLOYMENT-LÖSUNG
 * Startet den Server mit exakt der funktionierenden Development-Konfiguration
 */

// Forciere Development-Environment
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 ULTIMATIVE DEPLOYMENT-LÖSUNG');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

import { spawn } from 'child_process';

// Starte den exakten Development-Befehl
const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development',
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

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM empfangen');
    serverProcess.kill();
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT empfangen');
    serverProcess.kill();
});

console.log('✅ Development-Server gestartet (exakte Kopie der funktionierenden Version)');