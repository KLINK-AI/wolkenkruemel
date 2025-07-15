#!/usr/bin/env node

/**
 * SIMPLE DEPLOYMENT SOLUTION
 * Zurück zu den Grundlagen - 100% funktionsfähig
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

config();

console.log('🚀 SIMPLE DEPLOYMENT SOLUTION');
console.log('📅 Zurück zu den Grundlagen');

// Environment setup
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Available' : '❌ Missing');

// Test database first
console.log('\n🧪 Testing database...');
try {
    const sql = neon(process.env.DATABASE_URL);
    const activities = await sql`SELECT COUNT(*) as count FROM activities`;
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    
    console.log(`✅ Database works: ${activities[0].count} activities, ${users[0].count} users`);
} catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
}

// Create simple server
const simpleServer = `const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Simple status page
app.get('/', (req, res) => {
    res.send(\`
<!DOCTYPE html>
<html>
<head>
    <title>Wolkenkrümel Status</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .status { padding: 20px; margin: 20px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        button { padding: 10px 20px; margin: 10px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🐕☁️ Wolkenkrümel Status</h1>
    <div class="status success">
        <h3>✅ Server Running</h3>
        <p>Server is operational on port \${port}</p>
        <p>Environment: \${process.env.NODE_ENV}</p>
        <p>Time: \${new Date().toLocaleString()}</p>
    </div>
    
    <div>
        <button onclick="testAPI()">Test Database</button>
        <button onclick="location.reload()">Refresh</button>
    </div>
    
    <div id="results"></div>
    
    <script>
        async function testAPI() {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Testing...</p>';
            
            try {
                const response = await fetch('/api/test');
                const data = await response.json();
                
                if (response.ok) {
                    results.innerHTML = '<div class="status success"><h3>✅ API Test Successful</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                } else {
                    results.innerHTML = '<div class="status error"><h3>❌ API Test Failed</h3><p>' + data.error + '</p></div>';
                }
            } catch (error) {
                results.innerHTML = '<div class="status error"><h3>❌ Connection Error</h3><p>' + error.message + '</p></div>';
            }
        }
    </script>
</body>
</html>
    \`);
});

// Simple API endpoint
app.get('/api/test', async (req, res) => {
    try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        const activities = await sql\`SELECT COUNT(*) as count FROM activities\`;
        const users = await sql\`SELECT COUNT(*) as count FROM users\`;
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            port: port,
            database: {
                activities: activities[0].count,
                users: users[0].count
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(\`🚀 Simple server running on port \${port}\`);
    console.log(\`📊 Status: http://localhost:\${port}\`);
});
`;

writeFileSync('simple-server.js', simpleServer);
console.log('✅ Created simple server');

// Start the simple server
console.log('\n🚀 Starting simple server...');
const server = spawn('node', ['simple-server.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000'
    }
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`\n📊 Server closed with code: ${code}`);
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

console.log('✅ Simple deployment solution active');
console.log('🔧 No complex dependencies');
console.log('📊 Basic status page included');