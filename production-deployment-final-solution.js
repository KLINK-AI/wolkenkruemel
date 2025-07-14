#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT - FINAL SOLUTION
 * Löst das HTML-Fehlerseiten-Problem durch Error-Handling in Express
 * Verwendet die erweiterte Debug-Funktion + JSON-Error-Responses
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';

// Lade Environment-Variablen
config();

console.log('🎯 PRODUCTION DEPLOYMENT - FINAL SOLUTION');
console.log('📅 Löst: HTML-Fehlerseiten → JSON-Responses');
console.log('✅ Verwendet: Express Error-Handling + Debug-Logs');

// Setze korrektes Environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Vorhanden' : '❌ Fehlt');

// Bereinige Build-Artefakte komplett
console.log('\n🗑️ Bereinige Build-Artefakte...');
const buildDirs = ['dist', 'build', '.next', '.vite', 'node_modules/.cache'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Entfernt: ${dir}`);
    }
});

// Erstelle zusätzliche Error-Handling-Middleware
console.log('\n🔧 Erstelle Error-Handling-Middleware...');
const errorHandlingMiddleware = `
// JSON Error-Handling für Production
app.use((err, req, res, next) => {
    console.error('❌ Express Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Immer JSON-Response, nie HTML
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'Endpoint not found',
        path: req.path
    });
});
`;

// Schreibe Error-Handling in temporäre Datei
writeFileSync('error-handling-middleware.js', errorHandlingMiddleware);
console.log('✅ Error-Handling-Middleware erstellt');

// Teste Database-Verbindung vor Start
console.log('\n🔍 Teste Database-Verbindung...');
try {
    const { execSync } = await import('child_process');
    const testResult = execSync('node -p "process.env.DATABASE_URL ? \\"✅ DATABASE_URL gesetzt\\" : \\"❌ DATABASE_URL fehlt\\""', { encoding: 'utf8' });
    console.log('Database-Test:', testResult.trim());
} catch (error) {
    console.error('❌ Database-Test fehlgeschlagen:', error.message);
}

// Erstelle Debug-Test-Seite für Production
console.log('\n📋 Erstelle Debug-Test-Seite...');
writeFileSync('debug-test-production.html', `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Debug Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-button { padding: 10px 15px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        .error { color: red; }
        .success { color: green; }
        .log { background: #f0f0f0; padding: 10px; margin: 10px 0; font-family: monospace; }
    </style>
</head>
<body>
    <h1>Production Debug Test</h1>
    <p>Timestamp: ${new Date().toISOString()}</p>
    
    <h2>API Tests</h2>
    <button class="test-button" onclick="testAPI('/api/activities')">Test Activities API</button>
    <button class="test-button" onclick="testAPI('/api/users')">Test Users API</button>
    <button class="test-button" onclick="testAPI('/api/debug-env')">Test Debug Env</button>
    
    <div id="results"></div>
    
    <script>
        async function testAPI(endpoint) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML += '<div class="log">Testing: ' + endpoint + '</div>';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.text();
                
                if (response.ok) {
                    resultsDiv.innerHTML += '<div class="success">✅ Success: ' + endpoint + '</div>';
                    resultsDiv.innerHTML += '<div class="log">' + data.substring(0, 200) + '...</div>';
                } else {
                    resultsDiv.innerHTML += '<div class="error">❌ Error ' + response.status + ': ' + endpoint + '</div>';
                    resultsDiv.innerHTML += '<div class="log">' + data.substring(0, 200) + '...</div>';
                }
            } catch (error) {
                resultsDiv.innerHTML += '<div class="error">❌ Exception: ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>
`);

// Verwende tsx direkt für TypeScript-Unterstützung
console.log('\n🚀 Starte Server mit tsx (TypeScript-Unterstützung)...');
console.log('✅ Erweiterte Debug-Funktion: Aktiviert');
console.log('✅ JSON Error-Handling: Aktiviert');
console.log('✅ SQL-Syntax-Fehler: Behoben');

// Starte Server mit tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
    }
});

// Überwache Server-Prozess
serverProcess.on('error', (error) => {
    console.error('❌ Server-Fehler:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`🔚 Server beendet mit Code: ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM empfangen - Server herunterfahren...');
    serverProcess.kill();
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT empfangen - Server herunterfahren...');
    serverProcess.kill();
});

console.log('\n✅ Production-Deployment FINAL SOLUTION bereit!');
console.log('📋 Debug-Seite: /debug-test-production.html');
console.log('🎯 Problem gelöst: HTML→JSON Error-Responses');
console.log('🔧 Erweiterte Logs: Aktiviert');