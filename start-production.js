#!/usr/bin/env node

// Production starter with ES module support
import { config } from 'dotenv';
import { spawn } from 'child_process';

config();

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Starting Wolkenkrümel Production Server');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT);
console.log('💾 Database:', process.env.DATABASE_URL ? 'Connected' : 'Missing');

// Start with tsx for best TypeScript support
const server = spawn('tsx', ['--tsconfig=tsconfig.production.json', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
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
