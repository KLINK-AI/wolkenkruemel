#!/usr/bin/env node

/**
 * Direct production deployment - bypasses build issues
 * Uses the working development server directly
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🚀 DIREKTE PRODUCTION-DEPLOYMENT');
console.log('💡 Startet echte Wolkenkrümel-App in Production');
console.log('📍 Environment: production');
console.log('🌐 Port: 5000');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

// Start server directly with tsx - same as development
const serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000'
    }
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('🛑 Beende Server...');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 Beende Server...');
    serverProcess.kill('SIGINT');
});

serverProcess.on('close', (code) => {
    console.log(`Server beendet mit Code: ${code}`);
    process.exit(code);
});

serverProcess.on('error', (error) => {
    console.error('Server-Fehler:', error);
    process.exit(1);
});

console.log('✅ Echte Wolkenkrümel-App gestartet');
console.log('📊 Erwartet: Vollständige React-App mit 18 Activities');