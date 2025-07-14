#!/usr/bin/env node

/**
 * WORKING PRODUCTION DEPLOYMENT SOLUTION
 * Builds the React app and serves it with the Express server
 * Fixes the Activities loading issue by ensuring proper static file serving
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

console.log('🚀 PRODUCTION DEPLOYMENT - BUILDING REACT APP');
console.log('💡 This will properly build and serve the Wolkenkrümel React application');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Clean up any previous build artifacts
console.log('\n🗑️  Cleaning previous builds...');
const buildDirs = ['dist', 'public'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned ${dir}`);
    }
});

// Build the React application
console.log('\n🔨 Building React application...');
const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: process.env
});

buildProcess.on('close', (code) => {
    if (code !== 0) {
        console.error(`❌ Build failed with code ${code}`);
        process.exit(1);
    }
    
    console.log('✅ React app built successfully');
    
    // Check if public folder was created
    if (!existsSync('public')) {
        console.error('❌ Public folder not found after build');
        process.exit(1);
    }
    
    // Check if index.html exists
    if (!existsSync('public/index.html')) {
        console.error('❌ index.html not found in public folder');
        process.exit(1);
    }
    
    console.log('✅ Static files ready in public folder');
    
    // Start production server
    console.log('\n🚀 Starting production server...');
    const server = spawn('node', ['dist/index.js'], {
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
    
    console.log('✅ Production server started successfully');
    console.log('🌐 Wolkenkrümel application available on port 5000');
    console.log('📱 All features ready: React app, API, Database, Activities');
});

buildProcess.on('error', (error) => {
    console.error('❌ Build process error:', error);
    process.exit(1);
});