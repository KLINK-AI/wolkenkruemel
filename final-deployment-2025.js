const express = require('express');
const path = require('path');

// Simple setup without dynamic imports initially
console.log('🚀 Wolkenkrümel Final Deployment 2025');
console.log('Environment:', process.env.NODE_ENV || 'production');
console.log('Port:', process.env.PORT || 5000);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Wolkenkrümel 2025 - Post Support Response',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: 'Final-2025'
    });
});

// Database test endpoint
app.get('/api/database-test', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL not configured');
        }
        
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        const users = await sql`SELECT COUNT(*) as count FROM users`;
        const activities = await sql`SELECT COUNT(*) as count FROM activities`;
        const posts = await sql`SELECT COUNT(*) as count FROM posts`;
        
        res.json({
            status: 'SUCCESS',
            message: 'Database connection successful',
            data: {
                users: parseInt(users[0].count),
                activities: parseInt(activities[0].count),
                posts: parseInt(posts[0].count)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Simple HTML interface
app.get('*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Wolkenkrümel - Final 2025 Deployment Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f8ff; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #2c3e50; text-align: center; }
        .status { background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px; }
        .results { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px; max-height: 300px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐕☁️ Wolkenkrümel</h1>
        <div class="status">
            <h2>✅ Final 2025 Deployment - Post Support Response</h2>
            <p><strong>Zeit:</strong> ${new Date().toLocaleString('de-DE')}</p>
            <p><strong>Status:</strong> Nach 25 Tagen Support-Wartezeit</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
            <p><strong>Version:</strong> Final-2025</p>
        </div>
        
        <div class="status">
            <h3>🧪 System Tests</h3>
            <button class="button" onclick="testHealth()">Health Check</button>
            <button class="button" onclick="testDatabase()">Database Test</button>
            <div id="results" class="results"></div>
        </div>
        
        <div class="status">
            <h3>📋 Support Information</h3>
            <p>✅ Deployment erstellt nach Support-Response</p>
            <p>✅ Neue .replit.deploy Konfiguration</p>
            <p>✅ CommonJS für maximale Kompatibilität</p>
            <p>✅ Frische Logs für Support-Team</p>
        </div>
    </div>
    
    <script>
        async function apiCall(url, name) {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Testing ' + name + '...</p>';
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                results.innerHTML = '<h4>' + (response.ok ? '✅' : '❌') + ' ' + name + '</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                results.innerHTML = '<h4>❌ ' + name + ' Error</h4><pre>' + error.message + '</pre>';
            }
        }
        
        function testHealth() { apiCall('/api/health', 'Health Check'); }
        function testDatabase() { apiCall('/api/database-test', 'Database Test'); }
        
        // Auto-test on load
        window.onload = function() { testHealth(); };
    </script>
</body>
</html>
    `);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Final deployment running on port ${port}`);
    console.log(`✅ Ready for Replit deployment test`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});