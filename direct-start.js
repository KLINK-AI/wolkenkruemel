#!/usr/bin/env node

/**
 * DIREKTE WIEDERHERSTELLUNG - WIE ES UM 22:20 CET FUNKTIONIERTE
 * Verwendet tsx direkt ohne komplexe Builds
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

console.log('🚀 Starting Sunday 22:20 CET configuration...');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('📊 PORT:', process.env.PORT || 5000);

// Start server exactly like on Sunday
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || '5000'
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

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received');
    server.kill('SIGINT');
});

console.log('✅ Sunday 22:20 CET server started');
