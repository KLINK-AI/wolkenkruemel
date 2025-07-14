#!/usr/bin/env node

/**
 * DIREKTE WIEDERHERSTELLUNG - WIE ES UM 22:20 CET FUNKTIONIERTE
 * Verwendet tsx direkt ohne komplexe Builds
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Lade Environment-Variablen
config();

// Setze Production-Environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Direkte Wiederherstellung der 22:20 CET Version...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🌐 Port:', process.env.PORT);
console.log('💡 Methode: tsx server/index.ts (wie in Development)');

// Starte Server EXAKT wie um 22:20 CET - direkt mit tsx
const serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production'
    }
});

serverProcess.on('close', (code) => {
    console.log(`Server beendet mit Code: ${code}`);
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
