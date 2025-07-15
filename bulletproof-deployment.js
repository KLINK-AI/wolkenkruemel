#!/usr/bin/env node

/**
 * BULLETPROOF DEPLOYMENT SOLUTION
 * Komplett unabhängiger Server ohne ES Module Issues
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

config();

console.log('🚀 BULLETPROOF DEPLOYMENT SOLUTION');
console.log('📅 Keine ES Module Dependencies');

// Environment setup
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Available' : '❌ Missing');

// Cleanup
console.log('\n🧹 Cleanup...');
const cleanupDirs = ['dist', 'build', '.next', '.vite', 'public'];
cleanupDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// Create standalone server without ES module issues
const serverCode = `const express = require('express');
const { neon } = require('@neondatabase/serverless');

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: port
    });
});

// Activities endpoint
app.get('/api/activities', async (req, res) => {
    try {
        console.log('🔍 Fetching activities...');
        const activities = await sql\`
            SELECT * FROM activities 
            ORDER BY "createdAt" DESC 
            LIMIT 50
        \`;
        console.log(\`✅ Found \${activities.length} activities\`);
        res.json(activities);
    } catch (error) {
        console.error('❌ Activities error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch activities', 
            details: error.message 
        });
    }
});

// Users endpoint
app.get('/api/users', async (req, res) => {
    try {
        console.log('🔍 Fetching users...');
        const users = await sql\`
            SELECT id, username, email, "displayName", "createdAt" 
            FROM users 
            ORDER BY "createdAt" DESC
        \`;
        console.log(\`✅ Found \${users.length} users\`);
        res.json(users);
    } catch (error) {
        console.error('❌ Users error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch users', 
            details: error.message 
        });
    }
});

// Root endpoint with comprehensive status page
app.get('/', (req, res) => {
    const statusHtml = \`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Deployment Status</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #eff8f3 0%, #e8f5e8 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .logo { 
            font-size: 4rem; 
            margin-bottom: 10px; 
        }
        .title { 
            font-size: 2.5rem; 
            color: #2d3748;
            margin-bottom: 10px;
        }
        .subtitle { 
            color: #718096; 
            font-size: 1.2rem;
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 30px;
            margin-bottom: 40px;
        }
        .card { 
            background: white; 
            padding: 30px; 
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .card:hover { 
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        .card-header { 
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .card-icon { 
            font-size: 2rem; 
            margin-right: 15px;
        }
        .card-title { 
            font-size: 1.5rem; 
            font-weight: 600;
            color: #2d3748;
        }
        .card-content { 
            color: #4a5568;
            line-height: 1.6;
        }
        .status-indicator { 
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .status-loading { background: #f6ad55; }
        .status-success { background: #68d391; }
        .status-error { background: #fc8181; }
        .button { 
            background: #4299e1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            margin: 8px;
            transition: all 0.3s ease;
        }
        .button:hover { 
            background: #3182ce;
            transform: translateY(-2px);
        }
        .button-success { background: #48bb78; }
        .button-success:hover { background: #38a169; }
        .button-danger { background: #e53e3e; }
        .button-danger:hover { background: #c53030; }
        .results { 
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }
        .controls { 
            text-align: center;
            margin: 30px 0;
        }
        .timestamp { 
            color: #a0aec0;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        .success-banner { 
            background: #c6f6d5;
            color: #22543d;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #9ae6b4;
            display: none;
        }
        .error-banner { 
            background: #fed7d7;
            color: #742a2a;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #fbb6ce;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🐕☁️</div>
            <h1 class="title">Wolkenkrümel</h1>
            <p class="subtitle">Hundetraining Community - Deployment Status</p>
        </div>

        <div id="success-banner" class="success-banner">
            <h3>🎉 Deployment Successful!</h3>
            <p>All systems are operational. The platform is ready for use.</p>
        </div>

        <div id="error-banner" class="error-banner">
            <h3>❌ Deployment Issues Detected</h3>
            <p>Some components are not working correctly. Check the status cards below for details.</p>
        </div>

        <div class="grid">
            <div class="card" id="server-card">
                <div class="card-header">
                    <div class="card-icon">🖥️</div>
                    <div class="card-title">Server Status</div>
                </div>
                <div class="card-content">
                    <div><span class="status-indicator status-loading"></span>Checking server health...</div>
                    <div class="timestamp">Last check: Loading...</div>
                </div>
            </div>

            <div class="card" id="database-card">
                <div class="card-header">
                    <div class="card-icon">🗄️</div>
                    <div class="card-title">Database Connection</div>
                </div>
                <div class="card-content">
                    <div><span class="status-indicator status-loading"></span>Testing database connection...</div>
                    <div class="timestamp">Last check: Loading...</div>
                </div>
            </div>

            <div class="card" id="activities-card">
                <div class="card-header">
                    <div class="card-icon">🎯</div>
                    <div class="card-title">Activities API</div>
                </div>
                <div class="card-content">
                    <div><span class="status-indicator status-loading"></span>Loading activities...</div>
                    <div class="timestamp">Last check: Loading...</div>
                </div>
            </div>

            <div class="card" id="users-card">
                <div class="card-header">
                    <div class="card-icon">👥</div>
                    <div class="card-title">Users API</div>
                </div>
                <div class="card-content">
                    <div><span class="status-indicator status-loading"></span>Loading users...</div>
                    <div class="timestamp">Last check: Loading...</div>
                </div>
            </div>
        </div>

        <div class="controls">
            <button class="button button-success" onclick="runAllTests()">🔄 Run All Tests</button>
            <button class="button" onclick="testEndpoint('/api/test')">Test Server</button>
            <button class="button" onclick="testEndpoint('/api/activities')">Test Activities</button>
            <button class="button" onclick="testEndpoint('/api/users')">Test Users</button>
            <button class="button button-danger" onclick="clearResults()">Clear Results</button>
        </div>

        <div id="results" class="results" style="display: none;"></div>
    </div>

    <script>
        let testResults = {};
        let allPassed = false;

        function updateCard(cardId, success, message, data = null) {
            const card = document.getElementById(cardId);
            const content = card.querySelector('.card-content');
            const indicator = content.querySelector('.status-indicator');
            const timestamp = content.querySelector('.timestamp');
            
            indicator.className = 'status-indicator ' + (success ? 'status-success' : 'status-error');
            content.querySelector('div').innerHTML = \`
                <span class="status-indicator \${success ? 'status-success' : 'status-error'}"></span>
                \${message}
            \`;
            timestamp.textContent = \`Last check: \${new Date().toLocaleTimeString()}\`;
            
            testResults[cardId] = { success, message, data };
            logResult(cardId, success, message, data);
            
            checkOverallStatus();
        }

        function logResult(test, success, message, data) {
            const results = document.getElementById('results');
            const timestamp = new Date().toLocaleTimeString();
            const status = success ? '✅ SUCCESS' : '❌ ERROR';
            
            let logEntry = \`[\${timestamp}] \${status} - \${test}: \${message}\`;
            if (data && Array.isArray(data)) {
                logEntry += \` (Count: \${data.length})\`;
            }
            logEntry += '\\n';
            
            results.textContent += logEntry;
            results.style.display = 'block';
            results.scrollTop = results.scrollHeight;
        }

        function checkOverallStatus() {
            const allTests = Object.values(testResults);
            if (allTests.length === 4) {
                allPassed = allTests.every(test => test.success);
                
                const successBanner = document.getElementById('success-banner');
                const errorBanner = document.getElementById('error-banner');
                
                if (allPassed) {
                    successBanner.style.display = 'block';
                    errorBanner.style.display = 'none';
                } else {
                    successBanner.style.display = 'none';
                    errorBanner.style.display = 'block';
                }
            }
        }

        async function testEndpoint(endpoint) {
            const cardMap = {
                '/api/test': 'server-card',
                '/api/activities': 'activities-card',
                '/api/users': 'users-card'
            };
            
            const cardId = cardMap[endpoint];
            if (!cardId) return;
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    let message = \`Status: \${response.status}\`;
                    if (Array.isArray(data)) {
                        message += \` - Found \${data.length} items\`;
                    }
                    updateCard(cardId, true, message, data);
                } else {
                    updateCard(cardId, false, \`Error: \${response.status} - \${data.error || 'Unknown error'}\`);
                }
            } catch (error) {
                updateCard(cardId, false, \`Network error: \${error.message}\`);
            }
        }

        async function runAllTests() {
            // Clear previous results
            testResults = {};
            document.getElementById('results').textContent = '';
            
            // Update all cards to loading state
            ['server-card', 'database-card', 'activities-card', 'users-card'].forEach(cardId => {
                const card = document.getElementById(cardId);
                const indicator = card.querySelector('.status-indicator');
                indicator.className = 'status-indicator status-loading';
            });
            
            // Run all tests
            await testEndpoint('/api/test');
            await testEndpoint('/api/activities');
            await testEndpoint('/api/users');
            
            // Database test is same as users test
            const usersResult = testResults['users-card'];
            if (usersResult) {
                updateCard('database-card', usersResult.success, 
                    usersResult.success ? 'Database connected successfully' : 'Database connection failed');
            }
        }

        function clearResults() {
            document.getElementById('results').textContent = '';
            document.getElementById('results').style.display = 'none';
        }

        // Auto-run tests when page loads
        window.addEventListener('load', () => {
            setTimeout(runAllTests, 1000);
        });

        // Auto-refresh every 2 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                runAllTests();
            }
        }, 120000);
    </script>
</body>
</html>\`;

    res.send(statusHtml);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(\`🚀 Bulletproof server running on port \${port}\`);
    console.log(\`🌐 Environment: \${process.env.NODE_ENV}\`);
    console.log(\`📊 Status dashboard: http://localhost:\${port}\`);
    console.log(\`✅ No ES module issues - using CommonJS\`);
});
`;

// Write the CommonJS server
writeFileSync('bulletproof-server.js', serverCode);
console.log('✅ Created bulletproof CommonJS server');

// Create package.json for CommonJS
const packageJson = {
    "name": "wolkenkruemel-deployment",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "bulletproof-server.js",
    "scripts": {
        "start": "node bulletproof-server.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "@neondatabase/serverless": "^0.9.0",
        "dotenv": "^16.3.1"
    }
};

writeFileSync('package-deployment.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Created deployment package.json');

// Test database connection directly
console.log('\n🧪 Testing database connection...');
try {
    const sql = neon(process.env.DATABASE_URL);
    const testQuery = await sql`SELECT COUNT(*) as count FROM activities`;
    console.log(`✅ Database test successful: ${testQuery[0].count} activities`);
    
    const usersQuery = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Users test successful: ${usersQuery[0].count} users`);
    
} catch (error) {
    console.error('❌ Database test failed:', error);
}

// Start the bulletproof server
console.log('\n🚀 Starting bulletproof server...');
const server = spawn('node', ['bulletproof-server.js'], {
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

console.log('✅ Bulletproof deployment solution active');
console.log('🔧 CommonJS server - no ES module issues');
console.log('📊 Comprehensive status dashboard included');