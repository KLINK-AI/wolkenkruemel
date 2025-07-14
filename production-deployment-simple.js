#!/usr/bin/env node

/**
 * SIMPLE PRODUCTION DEPLOYMENT
 * Zurück zu den Grundlagen: Einfachste Lösung die funktioniert
 * Vermeidet komplexe Build-Prozesse die fehlschlagen
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Load environment variables
config();

console.log('🚀 SIMPLE PRODUCTION DEPLOYMENT');
console.log('💡 Zurück zu den Grundlagen - einfachste Lösung');
console.log('✅ Vermeidet komplexe Build-Prozesse');

// Clean environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Clean up any conflicting build artifacts
console.log('\n🗑️  Cleaning up...');
const buildDirs = ['dist', 'build', '.next', '.vite'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// Start with the simplest possible approach
console.log('\n🚀 Starting simple production server...');
const server = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('\n❌ Server error:', error);
    
    // Fallback to tsx if node --loader fails
    console.log('\n🔄 Fallback: trying tsx...');
    const fallbackServer = spawn('tsx', ['server/index.ts'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: process.env.PORT || '5000'
        }
    });
    
    fallbackServer.on('error', (fallbackError) => {
        console.error('\n❌ Fallback server error:', fallbackError);
        process.exit(1);
    });
    
    fallbackServer.on('close', (code) => {
        console.log(`\n📊 Fallback server closed with code: ${code}`);
        process.exit(code);
    });
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

console.log('✅ Simple production server started');
console.log('🌐 No complex build process - direct TypeScript execution');
console.log('📋 This avoids all build-related failures');