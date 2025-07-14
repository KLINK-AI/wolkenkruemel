/**
 * IMMEDIATE DEPLOYMENT FIX
 * Direkte Lösung für das HTML-Fehlerseiten-Problem
 * Verwendet die funktionierende Development-Konfiguration
 */

console.log('🎯 IMMEDIATE DEPLOYMENT FIX - START');

// Forciere development environment
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '3000';

console.log('Environment Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Connected' : 'Missing');

import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS setup
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

// Debug info endpoint
app.get('/debug-info', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
        timestamp: new Date().toISOString(),
        database: process.env.DATABASE_URL ? 'Connected' : 'Missing'
    });
});

// Activities API mit direkter Implementierung
app.get('/api/activities', async (req, res) => {
    console.log('🔍 Activities API called');
    
    try {
        // Direkter Import der Storage-Funktion
        const { storage } = await import('./server/storage.js');
        
        console.log('✅ Storage imported successfully');
        
        const activities = await storage.getActivities();
        
        console.log('✅ Activities loaded:', activities.length);
        
        // Explizite JSON-Response
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(activities);
        
    } catch (error) {
        console.error('❌ Activities API Error:', error);
        
        // Garantierte JSON-Response auch bei Fehlern
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Users API
app.get('/api/users', async (req, res) => {
    console.log('🔍 Users API called');
    
    try {
        const { storage } = await import('./server/storage.js');
        const users = await storage.getUsers();
        
        console.log('✅ Users loaded:', users.length);
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users);
        
    } catch (error) {
        console.error('❌ Users API Error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test API direkt
app.get('/api/test', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        status: 'OK',
        message: 'Direct API test successful',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Fallback für alle API-Routen
app.use('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
        error: 'API Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Serve static files für React App
app.use(express.static('client/dist'));

// Fallback für SPA
app.get('*', (req, res) => {
    res.sendFile(process.cwd() + '/client/dist/index.html');
});

// Global error handler - garantiert JSON
app.use((err, req, res, next) => {
    console.error('🚨 Global Error Handler:', err);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ IMMEDIATE DEPLOYMENT FIX - SERVER STARTED');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📡 API available at /api/*`);
    console.log(`🔍 Debug info at /debug-info`);
    console.log(`🧪 Test API at /api/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM - Shutting down gracefully');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT - Shutting down gracefully');
    server.close(() => process.exit(0));
});

export default app;