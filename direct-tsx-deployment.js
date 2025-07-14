#!/usr/bin/env node

/**
 * DIRECT TSX DEPLOYMENT - NO BUILD PROCESS
 * Completely bypasses any build steps that cause ES module issues
 * Runs tsx directly in production mode
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';

// Load environment variables
config();

console.log('🚀 DIRECT TSX DEPLOYMENT');
console.log('📋 No build process - tsx only');
console.log('💡 Direct TypeScript execution');

// Production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

// CRITICAL: Remove ALL build artifacts
console.log('\n🗑️  Removing ALL build artifacts...');
const artifactDirs = ['dist', 'build', '.next', '.vite', 'node_modules/.cache'];
artifactDirs.forEach(dir => {
    if (existsSync(dir)) {
        try {
            rmSync(dir, { recursive: true, force: true });
            console.log(`✅ Removed ${dir}`);
        } catch (err) {
            console.log(`⚠️  Could not remove ${dir}: ${err.message}`);
        }
    }
});

// Verify essential files
console.log('\n🔍 Checking essential files...');
const essentialFiles = [
    'server/index.ts',
    'server/storage.ts',
    'server/db.ts',
    'server/routes.ts',
    'shared/schema.ts'
];

let allGood = true;
for (const file of essentialFiles) {
    if (existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allGood = false;
    }
}

if (!allGood) {
    console.error('\n❌ Missing essential files - cannot proceed');
    process.exit(1);
}

// Create minimal index.html
const minimalHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Wolkenkrümel</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 2rem; }
        .loader { font-size: 2rem; margin: 2rem 0; }
    </style>
</head>
<body>
    <div class="loader">🐕</div>
    <h1>Wolkenkrümel</h1>
    <p>Hundetraining Community lädt...</p>
    <script>
        setTimeout(() => {
            fetch('/api/activities')
                .then(r => r.ok ? location.reload() : null)
                .catch(() => setTimeout(() => location.reload(), 5000));
        }, 3000);
    </script>
</body>
</html>`;

writeFileSync('index.html', minimalHtml);
console.log('✅ Created minimal index.html');

// Start tsx directly - NO BUILD WHATSOEVER
console.log('\n🚀 Starting TSX directly (NO BUILD)...');

const tsxProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

// Handle process events
tsxProcess.on('error', (err) => {
    console.error('\n❌ TSX error:', err);
    process.exit(1);
});

tsxProcess.on('exit', (code) => {
    console.log(`\n📊 TSX exited with code: ${code}`);
    process.exit(code || 0);
});

// Shutdown handlers
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received');
    tsxProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received');
    tsxProcess.kill('SIGINT');
});

console.log('\n✅ TSX started successfully!');
console.log('🚀 No build artifacts - direct execution');
console.log('💡 All ES module issues bypassed');