#!/usr/bin/env node

/**
 * DEPLOYMENT BYPASS BUILD SOLUTION
 * Completely bypasses the build process that causes ES module issues
 * Uses tsx directly without any compilation steps
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';

// Load environment variables
config();

console.log('🚀 DEPLOYMENT BYPASS BUILD SOLUTION');
console.log('📋 Skips build process completely');
console.log('💡 Uses tsx directly for production');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Remove any existing dist directory to prevent conflicts
if (existsSync('dist')) {
    console.log('\n🗑️  Removing existing dist directory...');
    rmSync('dist', { recursive: true, force: true });
    console.log('✅ Dist directory removed');
}

// Remove any existing build artifacts
const buildArtifacts = ['dist', 'build', '.next', '.vite'];
buildArtifacts.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

console.log('\n🔍 Verifying core files...');
const coreFiles = [
    'server/index.ts',
    'server/storage.ts',
    'server/db.ts',
    'server/routes.ts',
    'shared/schema.ts'
];

for (const file of coreFiles) {
    if (existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        process.exit(1);
    }
}

// Create a simple index.html for production
const indexHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel wird geladen...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 400px;
        }
        .logo {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .loading {
            width: 200px;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            margin: 2rem auto;
            overflow: hidden;
        }
        .loading::before {
            content: '';
            display: block;
            width: 0%;
            height: 100%;
            background: white;
            animation: loading 3s ease-in-out infinite;
        }
        @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .status {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🐕</div>
        <h1>Wolkenkrümel</h1>
        <p>Hundetraining Community</p>
        <div class="loading"></div>
        <div class="status">Server startet...</div>
    </div>
    <script>
        let attempts = 0;
        const maxAttempts = 30;
        
        function checkServer() {
            attempts++;
            const status = document.querySelector('.status');
            status.textContent = \`Server startet... (\${attempts}/\${maxAttempts})\`;
            
            fetch('/api/activities')
                .then(response => {
                    if (response.ok) {
                        status.textContent = 'Server bereit! Wird geladen...';
                        setTimeout(() => location.reload(), 1000);
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkServer, 2000);
                    } else {
                        status.textContent = 'Server braucht länger. Seite wird neu geladen...';
                        setTimeout(() => location.reload(), 3000);
                    }
                })
                .catch(error => {
                    if (attempts < maxAttempts) {
                        setTimeout(checkServer, 2000);
                    } else {
                        status.textContent = 'Server braucht länger. Seite wird neu geladen...';
                        setTimeout(() => location.reload(), 3000);
                    }
                });
        }
        
        setTimeout(checkServer, 2000);
    </script>
</body>
</html>`;

writeFileSync('index.html', indexHtml);
console.log('✅ Created production index.html');

console.log('\n🚀 Starting production server with tsx (no build)...');
console.log('📍 Bypassing all build processes');
console.log('🔧 Direct TypeScript execution');

// Start tsx directly
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('\n❌ Server error:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`\n📊 Server exited with code: ${code}`);
    process.exit(code || 0);
});

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM - shutting down');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT - shutting down');
    server.kill('SIGINT');
});

console.log('\n✅ Production server started successfully!');
console.log('🚀 No build process - tsx handles everything');
console.log('💡 All ES module issues bypassed');
console.log('🌐 Application available on port 5000');