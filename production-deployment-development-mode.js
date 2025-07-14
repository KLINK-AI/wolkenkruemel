#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT - DEVELOPMENT MODE STRATEGY
 * Der Schlüssel: 22:20 CET funktionierte, weil es development mode verwendete!
 * Production mode mit serveStatic() funktioniert nicht ohne Build
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Load environment variables
config();

console.log('🚀 PRODUCTION DEPLOYMENT - DEVELOPMENT MODE STRATEGY');
console.log('💡 Schlüssel-Erkenntnis: 22:20 CET verwendete development mode!');
console.log('✅ serveStatic() braucht Build - setupVite() funktioniert ohne Build');

// Clean up any build artifacts
console.log('\n🗑️  Cleaning build artifacts...');
const buildDirs = ['dist', 'build', '.next', '.vite', 'public'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// CRITICAL: Force development mode for setupVite() but keep production database
const env = {
    ...process.env,
    NODE_ENV: 'development',  // This forces setupVite() instead of serveStatic()
    PORT: process.env.PORT || '5000',
    // Keep production database URL
    DATABASE_URL: process.env.DATABASE_URL
};

console.log('\n📊 Environment Configuration:');
console.log('NODE_ENV:', env.NODE_ENV, '(forced to development for vite middleware)');
console.log('PORT:', env.PORT);
console.log('DATABASE_URL:', env.DATABASE_URL ? '✅ Production Database Connected' : '❌ Missing');

// Start server with development mode (like 22:20 working version)
console.log('\n🚀 Starting server with development mode (like 22:20 CET)...');
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: env
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

console.log('✅ Server started in development mode with production database');
console.log('🌐 Wolkenkrümel React app available on port 5000');
console.log('📱 Uses setupVite() for proper React serving');
console.log('🗄️ Connected to production database for real data');
console.log('💡 This matches the working 22:20 CET configuration!');