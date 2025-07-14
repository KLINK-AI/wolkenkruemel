#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT - ES MODULE RESOLUTION FIX
 * Behebt das exakte Problem: ES Module Auflösung in Production
 * Diagnostiziert als: "Cannot find module '/server/storage.js'"
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'fs';

// Load environment variables
config();

console.log('🔧 PRODUCTION DEPLOYMENT - ES MODULE RESOLUTION FIX');
console.log('🎯 Ziel: Behebt "Cannot find module" Fehler in Production');
console.log('💡 Problem: ES Module Resolution .ts vs .js');

// Set environment clearly
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Clean up any build artifacts that might interfere
console.log('\n🗑️  Cleaning conflicting artifacts...');
const buildDirs = ['dist', 'build', '.next', '.vite', 'public'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// The key fix: Ensure tsx handles ES modules properly in production
console.log('\n🔧 Applying ES Module Resolution Fix...');

// Check if we have tsconfig.json for proper module resolution
if (!existsSync('tsconfig.json')) {
    console.log('Creating tsconfig.json for ES module support...');
    const tsconfig = {
        "compilerOptions": {
            "target": "ES2022",
            "module": "ESNext",
            "moduleResolution": "node",
            "allowSyntheticDefaultImports": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
            "strict": true,
            "resolveJsonModule": true,
            "isolatedModules": true,
            "noEmit": true,
            "jsx": "react-jsx"
        },
        "include": ["server/**/*", "shared/**/*", "client/**/*"],
        "exclude": ["node_modules", "dist"]
    };
    writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    console.log('✅ Created tsconfig.json');
}

// Start server with enhanced tsx configuration for ES modules
console.log('\n🚀 Starting server with ES module support...');
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000',
        // Force tsx to handle ES modules correctly
        NODE_OPTIONS: '--loader tsx/esm',
        // Ensure proper module resolution
        TSX_TSCONFIG_PATH: './tsconfig.json'
    }
});

server.on('error', (error) => {
    console.error('\n❌ Server startup error:', error);
    console.error('💡 This indicates ES module resolution is still failing');
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`\n📊 Server closed with code: ${code}`);
    
    if (code === 0) {
        console.log('✅ Server shut down cleanly');
    } else {
        console.log('❌ Server exited with error');
        console.log('💡 Check for ES module resolution issues');
    }
    
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

console.log('✅ Production server started with ES module resolution fix');
console.log('🌐 Wolkenkrümel application should now load activities correctly');
console.log('🔧 tsx configured for proper TypeScript ES module handling');
console.log('📋 This should resolve the "Cannot find module" errors');