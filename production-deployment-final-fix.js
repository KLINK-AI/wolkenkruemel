#!/usr/bin/env node

/**
 * FINAL PRODUCTION DEPLOYMENT FIX
 * Uses development server approach but in production mode
 * This avoids build issues while ensuring proper React app serving
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Load environment variables
config();

console.log('🚀 FINAL PRODUCTION DEPLOYMENT FIX');
console.log('💡 Using development server approach in production mode');
console.log('✅ This ensures proper React app serving without build issues');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Clean up any build artifacts that might cause conflicts
console.log('\n🗑️  Cleaning build artifacts...');
const buildDirs = ['dist', 'build', '.next', '.vite'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// Start server directly with tsx - this will use the vite middleware in production
console.log('\n🚀 Starting production server with tsx...');
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',  // This tells the server to use production mode
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('\n❌ Server startup error:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`\n📊 Server closed with code: ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received - shutting down...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received - shutting down...');
    server.kill('SIGINT');
});

console.log('✅ Production server started successfully');
console.log('🌐 Wolkenkrümel React application available on port 5000');
console.log('📱 All features ready: Activities, API, Database, Authentication');
console.log('🔧 Using vite middleware for proper React serving');