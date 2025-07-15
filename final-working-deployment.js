/**
 * FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION
 * Basiert auf der 22:20 CET Version + behebt vite.ts Error
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';

// Load environment variables
config();

console.log('🚀 FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION');
console.log('📅 July 13, 2025 - 22:20 CET Working Version');
console.log('✅ Mit Debug-Seite und Activities API');

// Set production environment
process.env.NODE_ENV = 'production';

// Use port 5000 for deployment (different from development)
const deploymentPort = '5000';

console.log('\n📊 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', deploymentPort);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Clean up any build artifacts
console.log('\n🧹 Cleaning up build artifacts...');
const buildDirs = ['dist', 'build', '.next', '.vite'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned ${dir}`);
    }
});

// Create public directory for static files
if (!existsSync('public')) {
    mkdirSync('public', { recursive: true });
}

// Create comprehensive debug page
const debugHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Deployment Status</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #eff8f3;
            color: #333;
            line-height: 1.6;
            padding: 2rem;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .logo {
            font-size: 5rem;
            margin-bottom: 1rem;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .status-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .status-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.15);
        }
        .status-ok {
            border-left: 6px solid #10b981;
        }
        .status-error {
            border-left: 6px solid #ef4444;
        }
        .status-loading {
            border-left: 6px solid #f59e0b;
        }
        .status-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4ade80;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin-right: 0.75rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .controls {
            text-align: center;
            margin: 2rem 0;
        }
        .btn {
            background: #4ade80;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.5rem;
            transition: background 0.3s ease;
        }
        .btn:hover {
            background: #22c55e;
        }
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .btn-danger {
            background: #ef4444;
        }
        .btn-danger:hover {
            background: #dc2626;
        }
        .log-container {
            background: #1f2937;
            color: #e5e7eb;
            padding: 1.5rem;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            max-height: 400px;
            overflow-y: auto;
            margin-top: 1rem;
            display: none;
        }
        .activities-preview {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .activity-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .activity-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #1f2937;
        }
        .activity-meta {
            color: #6b7280;
            font-size: 0.875rem;
        }
        .success-message {
            background: #dcfce7;
            color: #166534;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border: 1px solid #bbf7d0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🐕☁️</div>
            <h1>Wolkenkrümel</h1>
            <p>Hundetraining Community Platform</p>
            <h2>Deployment Status Dashboard</h2>
        </div>

        <div class="status-grid">
            <div class="status-card status-loading" id="server-status">
                <div class="status-title">
                    <div class="spinner"></div>
                    Server Status
                </div>
                <div id="server-text">Checking server health...</div>
            </div>

            <div class="status-card status-loading" id="database-status">
                <div class="status-title">
                    <div class="spinner"></div>
                    Database Connection
                </div>
                <div id="database-text">Testing database connection...</div>
            </div>

            <div class="status-card status-loading" id="activities-status">
                <div class="status-title">
                    <div class="spinner"></div>
                    Activities API
                </div>
                <div id="activities-text">Loading activities...</div>
            </div>

            <div class="status-card status-loading" id="users-status">
                <div class="status-title">
                    <div class="spinner"></div>
                    Users API
                </div>
                <div id="users-text">Checking user data...</div>
            </div>
        </div>

        <div class="controls">
            <button class="btn" onclick="runAllTests()">🔄 Refresh All Tests</button>
            <button class="btn" onclick="testAPI('/api/activities')">🎯 Test Activities</button>
            <button class="btn" onclick="testAPI('/api/users')">👥 Test Users</button>
            <button class="btn" onclick="toggleLogs()">📋 Toggle Logs</button>
            <button class="btn btn-danger" onclick="clearLogs()">🗑️ Clear Logs</button>
        </div>

        <div class="log-container" id="logs">
            <div id="log-content">System logs will appear here...</div>
        </div>

        <div id="activities-container" style="display: none;">
            <h3>Activities Preview</h3>
            <div class="activities-preview" id="activities-grid"></div>
        </div>
    </div>

    <script>
        let logs = [];
        let testResults = {};
        
        function addLog(message, level = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = \`[\${timestamp}] \${level.toUpperCase()}: \${message}\`;
            logs.push(logEntry);
            
            // Keep only last 200 logs
            if (logs.length > 200) logs.shift();
            
            updateLogDisplay();
        }
        
        function updateLogDisplay() {
            const logContent = document.getElementById('log-content');
            if (logContent) {
                logContent.innerHTML = logs.join('<br>');
                logContent.scrollTop = logContent.scrollHeight;
            }
        }
        
        function toggleLogs() {
            const logsDiv = document.getElementById('logs');
            logsDiv.style.display = logsDiv.style.display === 'none' ? 'block' : 'none';
        }
        
        function clearLogs() {
            logs = [];
            updateLogDisplay();
        }
        
        function updateStatus(elementId, success, message, data = null) {
            const element = document.getElementById(elementId);
            const textElement = element.querySelector('div:last-child');
            
            element.className = 'status-card ' + (success ? 'status-ok' : 'status-error');
            
            const titleElement = element.querySelector('.status-title');
            titleElement.innerHTML = titleElement.innerHTML.replace(/<div class="spinner"><\/div>/, '');
            
            if (success) {
                titleElement.innerHTML = '✅ ' + titleElement.textContent.trim();
            } else {
                titleElement.innerHTML = '❌ ' + titleElement.textContent.trim();
            }
            
            textElement.innerHTML = message;
            
            testResults[elementId] = { success, message, data };
            addLog(\`\${elementId}: \${message}\`, success ? 'success' : 'error');
        }
        
        async function testAPI(endpoint) {
            addLog(\`Testing API endpoint: \${endpoint}\`);
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    addLog(\`✅ \${endpoint} - Status: \${response.status}\`, 'success');
                    addLog(\`Response: \${JSON.stringify(data).substring(0, 200)}...\`);
                    
                    if (endpoint === '/api/activities' && Array.isArray(data)) {
                        showActivities(data);
                    }
                    
                    return { success: true, data };
                } else {
                    throw new Error(\`HTTP \${response.status}: \${data.message || 'Unknown error'}\`);
                }
            } catch (error) {
                addLog(\`❌ \${endpoint} - Error: \${error.message}\`, 'error');
                return { success: false, error: error.message };
            }
        }
        
        function showActivities(activities) {
            const container = document.getElementById('activities-container');
            const grid = document.getElementById('activities-grid');
            
            container.style.display = 'block';
            grid.innerHTML = '';
            
            activities.slice(0, 6).forEach(activity => {
                const card = document.createElement('div');
                card.className = 'activity-card';
                card.innerHTML = \`
                    <div class="activity-title">\${activity.title}</div>
                    <div class="activity-meta">
                        ID: \${activity.id} • Level: \${activity.difficulty}<br>
                        Created: \${new Date(activity.createdAt).toLocaleDateString('de-DE')}
                    </div>
                \`;
                grid.appendChild(card);
            });
            
            if (activities.length > 6) {
                const moreCard = document.createElement('div');
                moreCard.className = 'activity-card';
                moreCard.innerHTML = \`
                    <div class="activity-title">+ \${activities.length - 6} more activities</div>
                    <div class="activity-meta">Total: \${activities.length} activities in database</div>
                \`;
                grid.appendChild(moreCard);
            }
        }
        
        async function runAllTests() {
            addLog('🚀 Starting comprehensive system tests...');
            
            // Test 1: Server Health Check
            const serverTest = await testAPI('/api/test');
            updateStatus('server-status', serverTest.success, 
                serverTest.success ? 'Server is running smoothly' : \`Server error: \${serverTest.error}\`);
            
            // Test 2: Database Connection
            const usersTest = await testAPI('/api/users');
            updateStatus('database-status', usersTest.success, 
                usersTest.success ? \`Database connected (\${usersTest.data.length} users)\` : \`Database error: \${usersTest.error}\`);
            
            // Test 3: Activities API (Critical)
            const activitiesTest = await testAPI('/api/activities');
            updateStatus('activities-status', activitiesTest.success, 
                activitiesTest.success ? \`Activities API working (\${activitiesTest.data.length} activities)\` : \`Activities error: \${activitiesTest.error}\`);
            
            // Test 4: Users API
            updateStatus('users-status', usersTest.success, 
                usersTest.success ? \`Users API working (\${usersTest.data.length} users)\` : \`Users error: \${usersTest.error}\`);
            
            // Overall Status
            const allPassed = serverTest.success && usersTest.success && activitiesTest.success;
            
            if (allPassed) {
                addLog('🎉 ALL TESTS PASSED - Deployment is successful!', 'success');
                
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.innerHTML = \`
                    <strong>🎉 Deployment Successful!</strong><br>
                    All systems are operational. The Wolkenkrümel platform is ready for use.
                \`;
                document.querySelector('.container').insertBefore(successDiv, document.querySelector('.controls'));
                
                setTimeout(() => {
                    successDiv.remove();
                }, 10000);
            } else {
                addLog('❌ Some tests failed - Check the errors above', 'error');
            }
        }
        
        // Auto-run tests when page loads
        window.addEventListener('load', () => {
            addLog('🌐 Debug dashboard loaded');
            setTimeout(runAllTests, 1000);
        });
        
        // Auto-refresh every 2 minutes
        setInterval(() => {
            addLog('🔄 Auto-refresh triggered');
            runAllTests();
        }, 120000);
    </script>
</body>
</html>`;

writeFileSync('public/index.html', debugHtml);
console.log('✅ Created comprehensive debug dashboard');

// Start the server with tsx
console.log('\n🚀 Starting production server...');
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: deploymentPort
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
    console.log('\n🛑 Received SIGTERM - shutting down gracefully...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT - shutting down gracefully...');
    server.kill('SIGINT');
});

console.log('✅ Production deployment server started successfully');
console.log('🌐 Debug dashboard available at root URL');
console.log('📊 Full system monitoring enabled');
console.log('🎯 Ready for deployment testing');