/**
 * SOFORTIGE DEPLOYMENT-LÖSUNG
 * Behebt das Problem, dass Deploy-Button nicht funktioniert
 */

// Forciere ALLES auf development
process.env.NODE_ENV = 'development';
process.env.VITE_NODE_ENV = 'development';
process.env.ENVIRONMENT = 'development';

console.log('🚀 SOFORTIGE DEPLOYMENT-LÖSUNG');
console.log('Zwinge alle Environment-Variablen auf development...');

// Überschreibe alle möglichen Production-Einstellungen
Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'development',
    writable: false,
    enumerable: true,
    configurable: false
});

console.log('✅ NODE_ENV forciert auf:', process.env.NODE_ENV);

import { spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';

// Erstelle eine einfache server.js die garantiert funktioniert
const simpleServer = `
const express = require('express');
const path = require('path');
const app = express();

// Forciere development
process.env.NODE_ENV = 'development';

console.log('🎯 Simple Server - NODE_ENV:', process.env.NODE_ENV);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test API
app.get('/api/test', (req, res) => {
    res.json({
        status: 'OK',
        environment: process.env.NODE_ENV,
        message: 'Simple server working',
        timestamp: new Date().toISOString()
    });
});

// Activities API - Direkte Implementierung
app.get('/api/activities', async (req, res) => {
    try {
        console.log('🔍 Loading activities...');
        
        // Dynamischer Import von storage
        const { storage } = await import('./server/storage.js');
        const activities = await storage.getActivities();
        
        console.log('✅ Activities loaded:', activities.length);
        res.json(activities);
        
    } catch (error) {
        console.error('❌ Activities error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Users API
app.get('/api/users', async (req, res) => {
    try {
        console.log('🔍 Loading users...');
        
        const { storage } = await import('./server/storage.js');
        const users = await storage.getUsers();
        
        console.log('✅ Users loaded:', users.length);
        res.json(users);
        
    } catch (error) {
        console.error('❌ Users error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Static files
app.use(express.static('client/dist'));

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ SIMPLE SERVER STARTED');
    console.log('Port:', PORT);
    console.log('Environment:', process.env.NODE_ENV);
});
`;

// Schreibe simple server
writeFileSync('simple-server.js', simpleServer);

console.log('✅ Simple server erstellt');

// Starte den simple server
const serverProcess = spawn('node', ['simple-server.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: process.env.PORT || '3000'
    }
});

serverProcess.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`Server exited with code: ${code}`);
    process.exit(code);
});

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received');
    serverProcess.kill();
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received');
    serverProcess.kill();
});

async function testDevelopmentAPI() {
    // Warte 2 Sekunden dann teste die API
    setTimeout(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/test');
            const data = await response.json();
            console.log('✅ API Test erfolgreich:', data);
        } catch (error) {
            console.error('❌ API Test fehlgeschlagen:', error);
        }
    }, 2000);
}

testDevelopmentAPI();

function startProductionServer() {
    console.log('🚀 Production Server mit Development-Modus gestartet');
    console.log('Environment zwingend auf development gesetzt');
    console.log('Server läuft auf Port', process.env.PORT || '3000');
}

startProductionServer();