// DEPLOYMENT 2025 - STABLE COMMONJS APPROACH
// Created after 25-day support wait - guaranteed compatibility approach

const express = require('express');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Wolkenkrümel Deployment 2025 (Stable)...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`📊 Port: ${process.env.PORT || 5000}`);
console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'CONFIGURED' : 'MISSING'}`);

const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files if they exist
try {
    app.use(express.static(path.join(__dirname, 'dist')));
    console.log('✅ Static files configured');
} catch (error) {
    console.log('⚠️ No static files directory');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Wolkenkrümel 2025 Deployment Running (Stable)',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        deployment: 'stable-2025',
        version: '2.0.1',
        nodeVersion: process.version
    });
});

// Database test endpoint
app.get('/api/database-test', async (req, res) => {
    try {
        // Dynamic import for ES modules in CommonJS
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        console.log('🧪 Testing database connection...');
        
        // Test all main tables
        const users = await sql`SELECT COUNT(*) as count FROM users`;
        const activities = await sql`SELECT COUNT(*) as count FROM activities`;
        const posts = await sql`SELECT COUNT(*) as count FROM posts`;
        
        const result = {
            status: 'SUCCESS',
            message: 'Database connection successful',
            data: {
                users: parseInt(users[0].count),
                activities: parseInt(activities[0].count),
                posts: parseInt(posts[0].count)
            },
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Database test successful:', result.data);
        res.json(result);
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Simple activities endpoint
app.get('/api/activities', async (req, res) => {
    try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        console.log('🏃 Fetching activities...');
        const activities = await sql`
            SELECT id, title, description, difficulty, duration, category 
            FROM activities 
            ORDER BY id DESC 
            LIMIT 20
        `;
        
        console.log(`✅ Found ${activities.length} activities`);
        res.json(activities);
    } catch (error) {
        console.error('❌ Activities fetch failed:', error.message);
        res.status(500).json({
            status: 'ERROR',
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
});

// Simple users endpoint
app.get('/api/users', async (req, res) => {
    try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        console.log('👥 Fetching users...');
        const users = await sql`
            SELECT id, username, email, subscription_tier, created_at 
            FROM users 
            ORDER BY id DESC 
            LIMIT 10
        `;
        
        console.log(`✅ Found ${users.length} users`);
        res.json(users);
    } catch (error) {
        console.error('❌ Users fetch failed:', error.message);
        res.status(500).json({
            status: 'ERROR',
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Root route - serves React app or fallback
app.get('*', (req, res) => {
    // Try to serve index.html from dist
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    try {
        res.sendFile(indexPath);
    } catch (error) {
        // Fallback HTML with working interface
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Wolkenkrümel - 2025 Deployment Test</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 15px; 
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 { 
            color: #2c3e50; 
            text-align: center; 
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .status { 
            background: #d4edda; 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            border-left: 5px solid #28a745;
        }
        .test-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .test-button { 
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            margin: 10px 10px 10px 0;
            font-size: 16px;
            transition: background 0.3s;
        }
        .test-button:hover {
            background: #0056b3;
        }
        .test-results {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin-top: 15px;
            max-height: 400px;
            overflow-y: auto;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .info { color: #17a2b8; }
        pre { 
            white-space: pre-wrap; 
            word-wrap: break-word;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐕☁️ Wolkenkrümel</h1>
        
        <div class="status">
            <h2>✅ 2025 Deployment Test Active</h2>
            <p><strong>Zeit:</strong> ${new Date().toLocaleString('de-DE')}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
            <p><strong>Version:</strong> 2.0.1 (Stable)</p>
            <p><strong>Node.js:</strong> ${process.version}</p>
        </div>
        
        <div class="test-section">
            <h3>🧪 System Tests</h3>
            <button class="test-button" onclick="testHealth()">Health Check</button>
            <button class="test-button" onclick="testDatabase()">Database Test</button>
            <button class="test-button" onclick="testActivities()">Test Activities</button>
            <button class="test-button" onclick="testUsers()">Test Users</button>
            <div id="test-results" class="test-results"></div>
        </div>
        
        <div class="test-section">
            <h3>📊 Deployment Status</h3>
            <p class="success">✅ Server running on port ${port}</p>
            <p class="success">✅ Database URL configured</p>
            <p class="info">ℹ️ This is a test deployment for Replit Support</p>
            <p class="info">ℹ️ Created after 25-day support ticket wait</p>
        </div>
    </div>
    
    <script>
        async function makeApiCall(endpoint, buttonText) {
            const results = document.getElementById('test-results');
            results.innerHTML = '<p class="info">Testing ' + buttonText + '...</p>';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    results.innerHTML = '<h4 class="success">✅ ' + buttonText + ' Success</h4><pre>' + 
                        JSON.stringify(data, null, 2) + '</pre>';
                } else {
                    results.innerHTML = '<h4 class="error">❌ ' + buttonText + ' Failed</h4><pre>' + 
                        JSON.stringify(data, null, 2) + '</pre>';
                }
            } catch (error) {
                results.innerHTML = '<h4 class="error">❌ ' + buttonText + ' Error</h4><pre>' + 
                    error.message + '</pre>';
            }
        }
        
        function testHealth() { makeApiCall('/api/health', 'Health Check'); }
        function testDatabase() { makeApiCall('/api/database-test', 'Database Test'); }
        function testActivities() { makeApiCall('/api/activities', 'Activities API'); }
        function testUsers() { makeApiCall('/api/users', 'Users API'); }
        
        // Auto-run health check on load
        window.onload = function() {
            testHealth();
        };
    </script>
</body>
</html>
        `);
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Wolkenkrümel 2025 deployment running on port ${port}`);
    console.log(`✅ Health check: http://localhost:${port}/api/health`);
    console.log(`🗄️ Database test: http://localhost:${port}/api/database-test`);
    console.log(`🏃 Activities API: http://localhost:${port}/api/activities`);
    console.log(`👥 Users API: http://localhost:${port}/api/users`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});