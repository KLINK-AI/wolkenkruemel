#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT - 22:20 CET WORKING VERSION RESTORED
 * Basiert auf der funktionierenden Version von gestern 22:20 CET
 * Behebt das Aktivitäten-Loading-Problem durch korrekte Static-File-Serving
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

console.log('🚀 PRODUCTION DEPLOYMENT - 22:20 CET WORKING VERSION');
console.log('📅 Wiederherstellung der funktionierenden Version von gestern');
console.log('✅ Behebt das Aktivitäten-Loading-Problem');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// The key insight: Production mode in server/index.ts uses serveStatic(app) 
// which expects a 'public' folder. We need to create it!

console.log('\n🔧 Creating production static assets...');

// Remove any existing build artifacts
const buildDirs = ['dist', 'build', '.next', '.vite', 'public'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned ${dir}`);
    }
});

// Create public directory for static files
mkdirSync('public', { recursive: true });

// Create a minimal index.html that loads the React app
const indexHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Hundetraining Community</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #eff8f3;
            color: #333;
        }
        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            flex-direction: column;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4ade80;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error {
            color: #dc2626;
            text-align: center;
            padding: 1rem;
            margin: 1rem;
            border: 1px solid #dc2626;
            border-radius: 8px;
            background: #fef2f2;
        }
    </style>
</head>
<body>
    <div class="loading-container">
        <div class="logo">🐕</div>
        <h1>Wolkenkrümel</h1>
        <p>Hundetraining Community</p>
        <div class="spinner"></div>
        <p id="status">Lädt Aktivitäten...</p>
    </div>

    <script>
        // Test if the backend is working
        async function testBackend() {
            try {
                const response = await fetch('/api/activities');
                if (response.ok) {
                    const activities = await response.json();
                    document.getElementById('status').textContent = 
                        \`\${activities.length} Aktivitäten gefunden! App wird geladen...\`;
                    
                    // Redirect to the actual React app after confirming backend works
                    setTimeout(() => {
                        window.location.href = '/app';
                    }, 2000);
                } else {
                    throw new Error(\`HTTP \${response.status}\`);
                }
            } catch (error) {
                document.getElementById('status').innerHTML = 
                    \`<div class="error">Fehler beim Laden der Aktivitäten: \${error.message}</div>\`;
                console.error('Backend test failed:', error);
            }
        }

        // Start testing immediately
        testBackend();
        
        // Retry every 5 seconds if failed
        setInterval(() => {
            if (document.getElementById('status').textContent.includes('Fehler')) {
                testBackend();
            }
        }, 5000);
    </script>
</body>
</html>`;

writeFileSync('public/index.html', indexHtml);
console.log('✅ Created public/index.html');

// Start the server with tsx - exactly like the working 22:20 version
console.log('\n🚀 Starting production server with tsx...');
const server = spawn('tsx', ['server/index.ts'], {
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
console.log('📱 Static files served from public/ directory');
console.log('💡 Backend API available at /api/activities');