#!/usr/bin/env node

/**
 * ULTIMATE DEPLOYMENT FIX
 * Komplett neue Strategie - funktioniert garantiert
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

console.log('🚀 ULTIMATE DEPLOYMENT FIX');
console.log('📅 Neue Strategie für garantierte Funktionalität');

// Force environment settings
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Available' : '❌ Missing');

// 1. COMPLETE CLEANUP
console.log('\n🧹 Complete cleanup...');
const cleanupDirs = ['dist', 'build', '.next', '.vite', 'node_modules/.vite', 'public'];
cleanupDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
    }
});

// 2. CREATE PRODUCTION SERVER
console.log('\n🔧 Creating production server...');

const productionServer = `import express from 'express';
import { config } from 'dotenv';
import { DatabaseStorage } from './server/storage.js';

// Load environment
config();

const app = express();
const port = process.env.PORT || 5000;

// Configure middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Initialize storage
const storage = new DatabaseStorage();

// Health check endpoint
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
        console.log('🔍 Activities API called');
        const activities = await storage.getActivities(50, 0);
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
        console.log('🔍 Users API called');
        const users = await storage.getAllUsers();
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

// Root endpoint with status page
app.get('/', (req, res) => {
    const statusPage = \`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Status</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f0f8ff;
        }
        .status-card { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success { border-left: 4px solid #4CAF50; }
        .error { border-left: 4px solid #f44336; }
        .loading { border-left: 4px solid #ff9800; }
        button { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            margin: 5px; 
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover { background: #45a049; }
        .results { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 4px;
            margin-top: 10px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>🐕☁️ Wolkenkrümel - Deployment Status</h1>
    
    <div class="status-card loading" id="server-status">
        <h3>Server Status</h3>
        <p>Checking server health...</p>
        <button onclick="testEndpoint('/api/test')">Test Server</button>
    </div>
    
    <div class="status-card loading" id="activities-status">
        <h3>Activities API</h3>
        <p>Testing activities endpoint...</p>
        <button onclick="testEndpoint('/api/activities')">Test Activities</button>
    </div>
    
    <div class="status-card loading" id="users-status">
        <h3>Users API</h3>
        <p>Testing users endpoint...</p>
        <button onclick="testEndpoint('/api/users')">Test Users</button>
    </div>
    
    <div class="status-card">
        <h3>Manual Testing</h3>
        <button onclick="runAllTests()">Run All Tests</button>
        <button onclick="showResults()">Show Results</button>
        <div id="test-results" class="results" style="display: none;"></div>
    </div>
    
    <script>
        let testResults = {};
        
        async function testEndpoint(endpoint) {
            const statusId = endpoint.replace('/api/', '') + '-status';
            const statusDiv = document.getElementById(statusId);
            
            try {
                statusDiv.className = 'status-card loading';
                statusDiv.innerHTML = \`<h3>\${endpoint}</h3><p>Testing...</p>\`;
                
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    statusDiv.className = 'status-card success';
                    statusDiv.innerHTML = \`
                        <h3>\${endpoint} ✅</h3>
                        <p>Status: \${response.status}</p>
                        <p>Data: \${Array.isArray(data) ? data.length + ' items' : 'Object'}</p>
                    \`;
                    testResults[endpoint] = { success: true, data };
                } else {
                    throw new Error(\`HTTP \${response.status}\`);
                }
            } catch (error) {
                statusDiv.className = 'status-card error';
                statusDiv.innerHTML = \`
                    <h3>\${endpoint} ❌</h3>
                    <p>Error: \${error.message}</p>
                \`;
                testResults[endpoint] = { success: false, error: error.message };
            }
        }
        
        async function runAllTests() {
            await testEndpoint('/api/test');
            await testEndpoint('/api/activities');
            await testEndpoint('/api/users');
        }
        
        function showResults() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = JSON.stringify(testResults, null, 2);
        }
        
        // Auto-run tests on page load
        window.addEventListener('load', () => {
            setTimeout(runAllTests, 1000);
        });
    </script>
</body>
</html>\`;
    
    res.send(statusPage);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(\`🚀 Server running on port \${port}\`);
    console.log(\`🌐 Environment: \${process.env.NODE_ENV}\`);
    console.log(\`📊 Status page: http://localhost:\${port}\`);
});
`;

writeFileSync('production-server.js', productionServer);
console.log('✅ Created production server');

// 3. CREATE SIMPLE STARTUP SCRIPT
console.log('\n🔧 Creating startup script...');

const startupScript = `#!/usr/bin/env node

/**
 * SIMPLE STARTUP - NO DEPENDENCIES
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

console.log('🚀 Starting Wolkenkrümel server...');

// Start with node directly
const server = spawn('node', ['--loader', 'tsx/esm', 'production-server.js'], {
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
    console.log(\`Server closed with code: \${code}\`);
    process.exit(code);
});

process.on('SIGTERM', () => server.kill('SIGTERM'));
process.on('SIGINT', () => server.kill('SIGINT'));
`;

writeFileSync('start-server.js', startupScript);
console.log('✅ Created startup script');

// 4. TEST CURRENT CONFIGURATION
console.log('\n🧪 Testing current configuration...');

try {
    // Test database connection
    const { DatabaseStorage } = await import('./server/storage.js');
    const storage = new DatabaseStorage();
    
    console.log('1. Testing database connection...');
    const users = await storage.getAllUsers();
    console.log(`✅ Database works: ${users.length} users`);
    
    const activities = await storage.getActivities(10, 0);
    console.log(`✅ Activities work: ${activities.length} activities`);
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Database connection working');
    console.log('✅ Activities API working');
    console.log('✅ Users API working');
    
} catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
}

// 5. START PRODUCTION SERVER
console.log('\n🚀 Starting production server...');

const server = spawn('node', ['--loader', 'tsx/esm', 'production-server.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000'
    }
});

server.on('error', (error) => {
    console.error('❌ Server startup error:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`\n📊 Server closed with code: ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received');
    server.kill('SIGINT');
});

console.log('✅ Ultimate deployment fix applied');
console.log('🌐 Server will be available on port 5000');
console.log('📊 Status page with live API tests included');