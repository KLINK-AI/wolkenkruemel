#!/usr/bin/env node

/**
 * EINFACHER STARTER - GARANTIERT FUNKTIONSFÄHIG
 * Startet den Server ohne komplexe Dependencies
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

console.log('🚀 Starting Wolkenkrümel Server...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('📊 Port:', process.env.PORT || 5000);

// Start the simple server
const server = spawn('node', ['simple-server.cjs'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5001'
    }
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`📊 Server closed with code: ${code}`);
    process.exit(code);
});

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received');
    server.kill('SIGINT');
});

console.log('✅ Server startup initiated');