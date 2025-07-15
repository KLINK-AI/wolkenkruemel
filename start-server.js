#!/usr/bin/env node

/**
 * SIMPLE STARTUP - NO DEPENDENCIES
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

console.log('🚀 Starting Wolkenkrümel server...');

// Start with node directly
const server = spawn('node', ['--loader', 'tsx/esm', 'production-server.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000'
    }
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`Server closed with code: ${code}`);
    process.exit(code);
});

process.on('SIGTERM', () => server.kill('SIGTERM'));
process.on('SIGINT', () => server.kill('SIGINT'));
