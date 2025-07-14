/**
 * FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION
 * Basiert auf der 22:20 CET Version + behebt vite.ts Error
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// KRITISCH: Environment auf development setzen
process.env.NODE_ENV = 'development';
const PORT = process.env.PORT || 3000;

console.log('🎯 FINALE FUNKTIONIERENDE DEPLOYMENT-VERSION');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS für alle Routen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`${req.method} ${req.path} - Start`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} in ${duration}ms`);
    });
    
    next();
});

// Health Check Route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: PORT
    });
});

// API Routes - Direkt implementiert
app.get('/api/activities', async (req, res) => {
    try {
        console.log('🔍 Activities API - Start');
        
        // Importiere Storage dynamisch
        const { storage } = await import('./server/storage.js');
        
        console.log('✅ Storage importiert');
        
        const activities = await storage.getActivities();
        
        console.log('✅ Activities geladen:', activities.length);
        
        res.json(activities);
        
    } catch (error) {
        console.error('❌ Activities API Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack
        });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        console.log('🔍 Users API - Start');
        
        const { storage } = await import('./server/storage.js');
        const users = await storage.getUsers();
        
        console.log('✅ Users geladen:', users.length);
        
        res.json(users);
        
    } catch (error) {
        console.error('❌ Users API Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Fallback für alle anderen API-Routen
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API Route not found',
        path: req.path,
        method: req.method
    });
});

// Serve static files (React App)
app.use(express.static(join(__dirname, 'client/dist')));

// Fallback für SPA
app.get('*', (req, res) => {
    const indexPath = join(__dirname, 'client/dist/index.html');
    if (existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('React app not built');
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Global Error Handler:', err);
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ FINALE DEPLOYMENT-VERSION ERFOLGREICH GESTARTET!`);
    console.log(`🌐 Server läuft auf Port ${PORT}`);
    console.log(`📡 API verfügbar unter /api/*`);
    console.log(`🎯 Health Check: /health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM - Server wird beendet...');
    server.close(() => {
        console.log('✅ Server erfolgreich beendet');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT - Server wird beendet...');
    server.close(() => {
        console.log('✅ Server erfolgreich beendet');
        process.exit(0);
    });
});

export default app;