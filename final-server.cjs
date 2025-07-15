const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Status page
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Deployment Status</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f0f8ff;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo { font-size: 3rem; margin-bottom: 10px; }
        .status { 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .success { border-left: 4px solid #28a745; }
        .error { border-left: 4px solid #dc3545; }
        .loading { border-left: 4px solid #ffc107; }
        .button { 
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin: 8px;
            font-size: 16px;
        }
        .button:hover { background: #0056b3; }
        .button-success { background: #28a745; }
        .button-success:hover { background: #1e7e34; }
        .results { 
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .card h3 { margin-top: 0; color: #333; }
        .indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .green { background: #28a745; }
        .red { background: #dc3545; }
        .yellow { background: #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🐕☁️</div>
        <h1>Wolkenkrümel</h1>
        <p>Hundetraining Community - Deployment Status</p>
    </div>

    <div class="status success">
        <h3>✅ Server Running</h3>
        <p>Server is operational on port ${port}</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
        <p>Started: ${new Date().toLocaleString()}</p>
    </div>

    <div class="grid">
        <div class="card" id="server-card">
            <h3><span class="indicator yellow"></span>Server Health</h3>
            <p id="server-status">Click Test Server to check</p>
        </div>
        <div class="card" id="database-card">
            <h3><span class="indicator yellow"></span>Database Connection</h3>
            <p id="database-status">Click Test Database to check</p>
        </div>
        <div class="card" id="activities-card">
            <h3><span class="indicator yellow"></span>Activities API</h3>
            <p id="activities-status">Click Test Activities to check</p>
        </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <button class="button" onclick="testServer()">Test Server</button>
        <button class="button" onclick="testDatabase()">Test Database</button>
        <button class="button" onclick="testActivities()">Test Activities</button>
        <button class="button button-success" onclick="runAllTests()">Run All Tests</button>
    </div>

    <div id="results" class="results" style="display: none;">Test results will appear here...</div>

    <script>
        let testCount = 0;
        
        function log(message) {
            const results = document.getElementById('results');
            results.style.display = 'block';
            const timestamp = new Date().toLocaleTimeString();
            results.textContent += '[' + timestamp + '] ' + message + '\n';
            results.scrollTop = results.scrollHeight;
        }
        
        function updateCard(cardId, success, message) {
            const card = document.getElementById(cardId);
            const indicator = card.querySelector('.indicator');
            const status = card.querySelector('p');
            
            indicator.className = 'indicator ' + (success ? 'green' : 'red');
            status.textContent = message;
            
            log(cardId + ': ' + message);
        }
        
        async function testServer() {
            log('Testing server health...');
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                if (response.ok) {
                    updateCard('server-card', true, 'Server healthy - Status: ' + response.status);
                    return true;
                } else {
                    updateCard('server-card', false, 'Server error: ' + response.status);
                    return false;
                }
            } catch (error) {
                updateCard('server-card', false, 'Connection error: ' + error.message);
                return false;
            }
        }
        
        async function testDatabase() {
            log('Testing database connection...');
            try {
                const response = await fetch('/api/database');
                const data = await response.json();
                
                if (response.ok) {
                    updateCard('database-card', true, 'Database connected - ' + data.users + ' users, ' + data.activities + ' activities');
                    return true;
                } else {
                    updateCard('database-card', false, 'Database error: ' + data.error);
                    return false;
                }
            } catch (error) {
                updateCard('database-card', false, 'Connection error: ' + error.message);
                return false;
            }
        }
        
        async function testActivities() {
            log('Testing activities API...');
            try {
                const response = await fetch('/api/activities');
                const data = await response.json();
                
                if (response.ok) {
                    updateCard('activities-card', true, 'Activities API working - ' + data.length + ' activities loaded');
                    return true;
                } else {
                    updateCard('activities-card', false, 'Activities error: ' + data.error);
                    return false;
                }
            } catch (error) {
                updateCard('activities-card', false, 'Connection error: ' + error.message);
                return false;
            }
        }
        
        async function runAllTests() {
            log('Running all tests...');
            testCount++;
            
            const results = [
                await testServer(),
                await testDatabase(),
                await testActivities()
            ];
            
            const passed = results.filter(r => r).length;
            const total = results.length;
            
            log('Test run #' + testCount + ' completed: ' + passed + '/' + total + ' tests passed');
            
            if (passed === total) {
                log('🎉 All tests passed - Deployment successful!');
            } else {
                log('❌ Some tests failed - Check the cards above for details');
            }
        }
        
        // Auto-run tests on page load
        window.addEventListener('load', function() {
            setTimeout(runAllTests, 1000);
        });
    </script>
</body>
</html>`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: port,
        uptime: process.uptime()
    });
});

// Database test endpoint
app.get('/api/database', async (req, res) => {
    try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        const activities = await sql`SELECT COUNT(*) as count FROM activities`;
        const users = await sql`SELECT COUNT(*) as count FROM users`;
        
        res.json({
            status: 'connected',
            activities: activities[0].count,
            users: users[0].count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// Activities endpoint
app.get('/api/activities', async (req, res) => {
    try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        const activities = await sql`
            SELECT id, title, difficulty, "createdAt" 
            FROM activities 
            ORDER BY "createdAt" DESC 
            LIMIT 10
        `;
        
        res.json(activities);
    } catch (error) {
        console.error('Activities API error:', error);
        res.status(500).json({
            error: 'Failed to fetch activities',
            details: error.message
        });
    }
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
    console.log(`🚀 Final deployment server running on port ${port}`);
    console.log(`📊 Status page: http://localhost:${port}`);
    console.log(`✅ CommonJS server - no ES module issues`);
});
