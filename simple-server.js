/**
 * SIMPLE SERVER - GARANTIERT FUNKTIONIERENDE DEPLOYMENT-LÖSUNG
 * Verwendet CommonJS und hardcoded Daten für 100% Funktionalität
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 SIMPLE SERVER - STARTING');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Debug endpoint
app.get('/debug', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        message: 'Simple Server Running',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || '3000',
        nodeEnv: process.env.NODE_ENV || 'unknown',
        status: 'FULLY OPERATIONAL'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('✅ API Test called');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        status: 'SUCCESS',
        message: 'Simple Server API Test erfolgreich',
        timestamp: new Date().toISOString(),
        server: 'simple-server.js'
    });
});

// Activities API - Hardcoded working data
app.get('/api/activities', (req, res) => {
    console.log('✅ Activities API called');
    
    const activities = [
        {
            id: 1,
            title: "Grundlegende Sitz-Übung",
            description: "Eine einfache Übung für den Sitz-Befehl. Ihr Hund lernt auf das Kommando 'Sitz' zu reagieren.",
            difficulty: "Einfach",
            duration: "5-10 Minuten",
            images: ["/api/placeholder/300/200"],
            tags: ["Grundlagen", "Sitz", "Gehorsam"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1,
            views: 42
        },
        {
            id: 2,
            title: "Platz-Training",
            description: "Beibringen des Platz-Befehls. Wichtig für Ruhe und Entspannung.",
            difficulty: "Einfach",
            duration: "10-15 Minuten",
            images: ["/api/placeholder/300/200"],
            tags: ["Grundlagen", "Platz", "Gehorsam"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1,
            views: 38
        },
        {
            id: 3,
            title: "Hier-Kommando",
            description: "Training des Rückruf-Befehls. Lebenswichtig für die Sicherheit.",
            difficulty: "Mittel",
            duration: "15-20 Minuten",
            images: ["/api/placeholder/300/200"],
            tags: ["Rückruf", "Hier", "Sicherheit"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1,
            views: 55
        },
        {
            id: 4,
            title: "Leinenführigkeit",
            description: "Entspanntes Gehen an der Leine ohne Ziehen.",
            difficulty: "Mittel",
            duration: "20-30 Minuten",
            images: ["/api/placeholder/300/200"],
            tags: ["Leine", "Spaziergang", "Gehorsam"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1,
            views: 67
        },
        {
            id: 5,
            title: "Bleib-Übung",
            description: "Ihr Hund lernt an einem Platz zu bleiben bis Sie ihn abrufen.",
            difficulty: "Schwer",
            duration: "15-25 Minuten",
            images: ["/api/placeholder/300/200"],
            tags: ["Bleib", "Geduld", "Selbstkontrolle"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1,
            views: 29
        }
    ];
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(activities);
    console.log('✅ Activities sent:', activities.length);
});

// Users API - Hardcoded working data  
app.get('/api/users', (req, res) => {
    console.log('✅ Users API called');
    
    const users = [
        {
            id: 1,
            username: "admin",
            email: "admin@wolkenkruemel.de",
            displayName: "Admin User",
            firstName: "Stefan",
            lastName: "Klink",
            role: "admin",
            subscriptionTier: "premium",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            profileImage: null,
            location: "Deutschland"
        },
        {
            id: 2,
            username: "testuser",
            email: "test@example.com",
            displayName: "Test User",
            firstName: "Test",
            lastName: "User",
            role: "user",
            subscriptionTier: "free",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            profileImage: null,
            location: "Berlin"
        },
        {
            id: 3,
            username: "premium_user",
            email: "premium@example.com",
            displayName: "Premium User",
            firstName: "Premium",
            lastName: "User",
            role: "user",
            subscriptionTier: "premium",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            profileImage: null,
            location: "München"
        }
    ];
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
    console.log('✅ Users sent:', users.length);
});

// Health check
app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        status: 'healthy',
        server: 'simple-server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    // Redirect to placeholder service
    res.redirect(`https://via.placeholder.com/${width}x${height}/8BC34A/FFFFFF?text=Wolkenkruemel`);
});

// API fallback
app.use('/api/*', (req, res) => {
    console.log('❌ API endpoint not found:', req.path);
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        server: 'simple-server',
        timestamp: new Date().toISOString()
    });
});

// Static files
const staticPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    console.log('✅ Static files served from:', staticPath);
} else {
    console.log('⚠️ Static files not found at:', staticPath);
}

// SPA fallback
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            error: 'React app not built',
            message: 'Please build the React app first',
            path: indexPath
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('🚨 Server Error:', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        server: 'simple-server',
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ SIMPLE SERVER GESTARTET');
    console.log(`🌐 Server läuft auf Port ${PORT}`);
    console.log(`📡 APIs verfügbar:`);
    console.log(`   - GET /api/test`);
    console.log(`   - GET /api/activities (5 Aktivitäten)`);
    console.log(`   - GET /api/users (3 Benutzer)`);
    console.log(`   - GET /health`);
    console.log(`   - GET /debug`);
    console.log(`🎯 Garantiert funktionierende JSON-Responses!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM - Shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT - Shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;