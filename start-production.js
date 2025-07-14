/**
 * PRODUCTION SERVER - KOMPLETT NEUE DEPLOYMENT-STRATEGIE
 * Umgeht alle Replit-Deployment-Probleme durch eigenständigen Server
 */

import express from 'express';
import { registerRoutes } from './server/routes.js';
import { setupVite } from './server/vite.js';
import dotenv from 'dotenv';

// Environment konfigurieren
dotenv.config();
process.env.NODE_ENV = 'development'; // Zwingt Vite-Middleware
const PORT = process.env.PORT || '3000'; // Anderer Port als Development

console.log('🎯 PRODUCTION SERVER - KOMPLETT NEUE STRATEGIE');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Database:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

const app = express();

// Middleware Setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Request Logging
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
                logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 100)}`;
            }
            console.log(logLine);
        }
    });

    next();
});

// Starte Server
(async () => {
    try {
        console.log('🔧 Registriere API Routes...');
        const server = await registerRoutes(app);

        // JSON Error Handler
        app.use((err, req, res, next) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";

            console.error(`❌ API Error [${status}]:`, message);
            console.error('Path:', req.path);
            console.error('Method:', req.method);

            res.status(status).json({ 
                error: message,
                status: status,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        console.log('🔧 Setup Vite Middleware...');
        await setupVite(app, server);

        // Server starten
        server.listen({
            port: parseInt(PORT),
            host: "0.0.0.0",
            reusePort: true,
        }, () => {
            console.log(`✅ PRODUCTION SERVER ERFOLGREICH GESTARTET!`);
            console.log(`🌐 Server läuft auf Port ${PORT}`);
            console.log(`📡 API verfügbar unter /api/*`);
            console.log(`🎯 React App wird über Vite-Middleware bereitgestellt`);
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

    } catch (error) {
        console.error('❌ Kritischer Server-Fehler:', error);
        process.exit(1);
    }
})();