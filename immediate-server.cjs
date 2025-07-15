const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Serve static files from client/dist if they exist
const staticPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(staticPath));

// Root route - simple working page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Server Running</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #eff8f3;
        }
        .card { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { border-left: 4px solid #28a745; }
        .info { border-left: 4px solid #007bff; }
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
    
    <div class="card success">
        <h2>✅ Server läuft erfolgreich!</h2>
        <p><strong>Zeit:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
        <p><strong>Port:</strong> ${port}</p>
        <p><strong>Status:</strong> CommonJS Server funktioniert</p>
    </div>
    
    <div class="card info">
        <h3>📊 Deployment Status</h3>
        <p>Dieser Server verwendet CommonJS statt TypeScript/ES Modules.</p>
        <p>Das löst das "Internal Server Error" Problem!</p>
        <p>Aktivitäten-API wird als nächstes hinzugefügt.</p>
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
            results.innerHTML = '<div class="card info"><h3>🔄 Testing API...</h3></div>';
            
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                if (response.ok) {
                    results.innerHTML = '<div class="card success"><h3>✅ API Test erfolgreich</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                } else {
                    results.innerHTML = '<div class="card info"><h3>ℹ️ API Test</h3><p>Status: ' + response.status + '</p></div>';
                }
            } catch (error) {
                results.innerHTML = '<div class="card info"><h3>ℹ️ API Test</h3><p>Error: ' + error.message + '</p></div>';
            }
        }
        
        async function testDatabase() {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="card info"><h3>🔄 Testing Database...</h3></div>';
            
            try {
                const response = await fetch('/api/database');
                const data = await response.json();
                
                if (response.ok) {
                    results.innerHTML = '<div class="card success"><h3>✅ Database Test erfolgreich</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                } else {
                    results.innerHTML = '<div class="card info"><h3>ℹ️ Database Test</h3><p>Status: ' + response.status + '</p></div>';
                }
            } catch (error) {
                results.innerHTML = '<div class="card info"><h3>ℹ️ Database Test</h3><p>Error: ' + error.message + '</p></div>';
            }
        }
    </script>
</body>
</html>
    `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CommonJS server is running successfully',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        port: port,
        deployment: 'immediate-server.cjs'
    });
});

// Database test endpoint
app.get('/api/database', async (req, res) => {
    try {
        // Use dynamic import for ES modules
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql\`SELECT COUNT(*) as count FROM activities\`;
        
        res.json({
            status: 'OK',
            message: 'Database connection successful',
            activityCount: result[0].count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Catch-all route for client-side routing
app.get('*', (req, res) => {
    res.redirect('/');
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Immediate server running on port ${port}`);
    console.log(`✅ CommonJS deployment successful`);
    console.log(`📊 Ready for next steps`);
});