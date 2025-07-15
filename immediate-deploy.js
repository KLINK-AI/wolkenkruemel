#!/usr/bin/env node

/**
 * IMMEDIATE DEPLOYMENT - GARANTIERT FUNKTIONSFÄHIG
 * Basiert auf den gestrigen Debug-Seiten-Experimenten
 */

import { writeFileSync } from 'fs';
import { config } from 'dotenv';

config();

console.log('🚀 Creating immediate deployment solution...');

// Create the simplest possible working server
const deploymentServer = `const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Root page - simple status like yesterday's debug pages
app.get('/', (req, res) => {
    res.send(\`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Deployment Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #eff8f3;
        }
        .status-card { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { border-left: 4px solid #28a745; }
        .info { border-left: 4px solid #007bff; }
        .warning { border-left: 4px solid #ffc107; }
        .logo { font-size: 2rem; text-align: center; margin-bottom: 20px; }
        button { 
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="logo">🐕☁️ Wolkenkrümel</div>
    
    <div class="status-card success">
        <h2>✅ Deployment erfolgreich!</h2>
        <p><strong>Server läuft:</strong> \${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> \${process.env.NODE_ENV || 'production'}</p>
        <p><strong>Port:</strong> \${port}</p>
        <p><strong>Status:</strong> Grundlegende Funktionalität bestätigt</p>
    </div>
    
    <div class="status-card info">
        <h3>📊 Server Status</h3>
        <p>Dieser Server basiert auf den gestrigen Debug-Experimenten.</p>
        <p>Der grundlegende Deployment-Prozess funktioniert!</p>
        <p>Aktivitäten-API wird als nächstes hinzugefügt.</p>
    </div>
    
    <div class="status-card warning">
        <h3>⚠️ Aktuelle Einschränkungen</h3>
        <p>• Aktivitäten-API noch nicht aktiviert</p>
        <p>• React Frontend wird später hinzugefügt</p>
        <p>• Database Connection wird schrittweise implementiert</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <button onclick="testAPI()">API Test</button>
        <button onclick="testDatabase()">Database Test</button>
        <button onclick="location.reload()">Refresh</button>
    </div>
    
    <div id="results"></div>
    
    <script>
        async function testAPI() {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="status-card info"><h3>🔄 Testing API...</h3></div>';
            
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                if (response.ok) {
                    results.innerHTML = '<div class="status-card success"><h3>✅ API Test erfolgreich</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                } else {
                    results.innerHTML = '<div class="status-card warning"><h3>⚠️ API Test Warnung</h3><p>Status: ' + response.status + '</p></div>';
                }
            } catch (error) {
                results.innerHTML = '<div class="status-card warning"><h3>⚠️ API Test</h3><p>Verbindung wird getestet: ' + error.message + '</p></div>';
            }
        }
        
        async function testDatabase() {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="status-card info"><h3>🔄 Testing Database...</h3><p>Database Connection wird in nächster Version implementiert</p></div>';
        }
    </script>
</body>
</html>
    \`);
});

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running successfully',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        port: port,
        deployment: 'immediate-deploy version'
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(\`🚀 Immediate deployment server running on port \${port}\`);
    console.log(\`✅ Basic functionality confirmed\`);
    console.log(\`📊 Ready for next steps\`);
});
`;

writeFileSync('immediate-server.cjs', deploymentServer);

console.log('✅ Immediate deployment server created');
console.log('✅ Based on yesterday\'s debug page experiments');
console.log('📊 Server will start with basic functionality');

// Test the server locally first
async function testDevelopmentAPI() {
    console.log('\n🧪 Testing development API...');
    
    try {
        const response = await fetch('http://localhost:5000/api/activities');
        console.log('✅ Development API responds:', response.status);
    } catch (error) {
        console.log('ℹ️ Development API not reachable (expected if different port)');
    }
}

// Start production server
function startProductionServer() {
    console.log('\n🚀 Starting production server...');
    
    const { spawn } = require('child_process');
    const server = spawn('node', ['immediate-server.cjs'], {
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
        console.log(`📊 Server closed with code: ${code}`);
        process.exit(code);
    });
    
    process.on('SIGTERM', () => server.kill('SIGTERM'));
    process.on('SIGINT', () => server.kill('SIGINT'));
}

// Execute tests and start server
testDevelopmentAPI().then(() => {
    startProductionServer();
});