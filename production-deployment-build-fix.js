#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT - BUILD PROCESS FIX
 * Nutzt den korrekten Build-Prozess wie in package.json definiert
 * Behebt das Problem durch proper Build statt tsx direct
 */

import { config } from 'dotenv';
import { spawn, spawnSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Load environment variables
config();

console.log('🔨 PRODUCTION DEPLOYMENT - BUILD PROCESS FIX');
console.log('💡 Verwendet den korrekten Build-Prozess aus package.json');
console.log('✅ Vermeidet ES Module Resolution Probleme');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Clean up any previous build artifacts
console.log('\n🗑️  Cleaning previous builds...');
const buildDirs = ['dist', 'build', '.next', '.vite', 'public'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// Build the application using the correct npm script
console.log('\n🔨 Building application...');
console.log('Running: npm run build');

const buildProcess = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production'
    }
});

if (buildProcess.status !== 0) {
    console.error('❌ Build failed');
    console.error('💡 Check the build process for errors');
    process.exit(1);
}

console.log('✅ Build completed successfully');

// Verify build artifacts exist
if (!existsSync('dist/index.js')) {
    console.error('❌ Build artifact missing: dist/index.js');
    console.error('💡 Build process did not create expected files');
    process.exit(1);
}

console.log('✅ Build artifacts verified');

// Start the production server using the built files
console.log('\n🚀 Starting production server...');
console.log('Running: npm run start');

const server = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
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

console.log('✅ Production server started from built files');
console.log('🌐 Wolkenkrümel application running from dist/index.js');
console.log('📋 This matches the intended build process from package.json');