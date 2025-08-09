// DEPLOYMENT 2025 - MODERN TYPESCRIPT APPROACH
// Created after 25-day support wait - fresh approach for current Replit system

import { config } from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Wolkenkrümel Deployment 2025...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`📊 Port: ${process.env.PORT || 5000}`);
console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'CONFIGURED' : 'MISSING'}`);

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('dist'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Wolkenkrümel 2025 Deployment Running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        deployment: 'modern-2025',
        version: '2.0.0'
    });
});

// Database test endpoint
app.get('/api/database-test', async (req, res) => {
    try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        // Test all main tables
        const users = await sql`SELECT COUNT(*) as count FROM users`;
        const activities = await sql`SELECT COUNT(*) as count FROM activities`;
        const posts = await sql`SELECT COUNT(*) as count FROM posts`;
        
        res.json({
            status: 'SUCCESS',
            message: 'Database connection successful',
            data: {
                users: users[0].count,
                activities: activities[0].count,
                posts: posts[0].count
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Try to load full server if available
let fullServerLoaded = false;
try {
    // Attempt to import the full server functionality
    const serverModule = await import('./server/index.js').catch(() => null);
    if (serverModule && serverModule.default) {
        console.log('✅ Full server module loaded successfully');
        fullServerLoaded = true;
        // Use the full server if available
        serverModule.default(app);
    }
} catch (error) {
    console.log('⚠️ Full server not available, using minimal mode:', error.message);
}

// Fallback route for React app
app.get('*', (req, res) => {
    if (fullServerLoaded) {
        // If full server is loaded, it should handle this
        return;
    }
    
    // Minimal fallback
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Wolkenkrümel - 2025 Deployment</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; background: #f0f8ff; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px; }
                h1 { color: #2c3e50; text-align: center; }
                .status { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .test-button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🐕☁️ Wolkenkrümel</h1>
                <div class="status">
                    <h2>✅ 2025 Deployment Active</h2>
                    <p><strong>Zeit:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
                    <p><strong>Version:</strong> 2.0.0</p>
                </div>
                <div class="status">
                    <h3>🧪 System Tests</h3>
                    <button class="test-button" onclick="testDatabase()">Test Database</button>
                    <button class="test-button" onclick="testHealth()">Test Health</button>
                    <div id="test-results"></div>
                </div>
            </div>
            <script>
                async function testDatabase() {
                    try {
                        const response = await fetch('/api/database-test');
                        const data = await response.json();
                        document.getElementById('test-results').innerHTML = 
                            '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    } catch (error) {
                        document.getElementById('test-results').innerHTML = 
                            '<pre style="color: red;">Error: ' + error.message + '</pre>';
                    }
                }
                
                async function testHealth() {
                    try {
                        const response = await fetch('/api/health');
                        const data = await response.json();
                        document.getElementById('test-results').innerHTML = 
                            '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    } catch (error) {
                        document.getElementById('test-results').innerHTML = 
                            '<pre style="color: red;">Error: ' + error.message + '</pre>';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Wolkenkrümel 2025 deployment running on port ${port}`);
    console.log(`✅ Health check: http://localhost:${port}/api/health`);
    console.log(`🗄️ Database test: http://localhost:${port}/api/database-test`);
    console.log(`📊 Full server loaded: ${fullServerLoaded ? 'YES' : 'NO'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});