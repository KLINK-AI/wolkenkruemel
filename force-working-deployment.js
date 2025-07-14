#!/usr/bin/env node

/**
 * FORCE WORKING DEPLOYMENT
 * Zwingt das System, die funktionierende Development-Konfiguration zu verwenden
 */

console.log('🎯 FORCE WORKING DEPLOYMENT - START');

// Direkte Übernahme des funktionierenden Development-Servers
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Setze Environment zwingend auf development
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('✅ Environment forciert:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Starte den exakten Development-Server
console.log('🚀 Starte funktionierenden Development-Server...');

try {
    // Importiere Express und Setup
    const express = require('express');
    const { registerRoutes } = require('./server/routes.js');
    const { setupVite } = require('./server/vite.js');
    const dotenv = require('dotenv');

    // Lade Environment-Variablen
    dotenv.config();

    console.log('✅ Module geladen');

    const app = express();
    
    // Exakte Konfiguration wie im funktionierenden Dev-Server
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));

    // Logging Middleware
    app.use((req, res, next) => {
        const start = Date.now();
        const path = req.path;
        let capturedJsonResponse = undefined;

        const originalResJson = res.json;
        res.json = function (bodyJson, ...args) {
            capturedJsonResponse = bodyJson;
            return originalResJson.apply(res, [bodyJson, ...args]);
        };

        res.on("finish", () => {
            const duration = Date.now() - start;
            if (path.startsWith("/api")) {
                let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                if (capturedJsonResponse) {
                    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                }
                if (logLine.length > 80) {
                    logLine = logLine.slice(0, 79) + "…";
                }
                console.log(logLine);
            }
        });

        next();
    });

    // Async setup
    (async () => {
        console.log('🔧 Registriere Routes...');
        const server = await registerRoutes(app);

        // JSON Error Handler
        app.use((err, req, res, next) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";

            console.error('❌ Error Handler:', message);
            console.error('Path:', req.path);

            res.status(status).json({ 
                error: message,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        // WICHTIG: Development-Modus für Vite
        console.log('🔧 Setup Vite (Development-Modus)...');
        await setupVite(app, server);

        // Starte Server
        const port = parseInt(process.env.PORT || '5000');
        server.listen({
            port: port,
            host: "0.0.0.0",
            reusePort: true,
        }, () => {
            console.log(`✅ Server erfolgreich gestartet auf Port ${port}`);
            console.log('🎯 FORCE WORKING DEPLOYMENT - ERFOLGREICH!');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM - Server beenden...');
            server.close(() => process.exit(0));
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT - Server beenden...');
            server.close(() => process.exit(0));
        });

    })();

} catch (error) {
    console.error('❌ Kritischer Fehler:', error);
    process.exit(1);
}