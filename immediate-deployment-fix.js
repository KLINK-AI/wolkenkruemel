#!/usr/bin/env node

/**
 * IMMEDIATE DEPLOYMENT FIX
 * Direkte Lösung für das HTML-Fehlerseiten-Problem
 * Verwendet die funktionierende Development-Konfiguration
 */

console.log('🚀 IMMEDIATE DEPLOYMENT FIX - STARTET...');

// Importiere die funktionierenden Module
import { config } from 'dotenv';
import express from 'express';
import { registerRoutes } from './server/routes.js';
import { setupVite } from './server/vite.js';

// Lade Environment-Variablen
config();

console.log('✅ Environment-Variablen geladen');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Vorhanden' : 'Fehlt');

const app = express();

// Konfiguration wie im funktionierenden Development-Server
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

// Registriere Routes
const server = await registerRoutes(app);

// Verbesserter Error-Handler für JSON-Responses
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('❌ Express Error Handler:', message);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Stack:', err.stack);

  // Immer JSON-Response, nie HTML-Fehlerseite
  res.status(status).json({ 
    error: message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Verwende Development-Konfiguration für React-App
console.log('🔧 Konfiguriere Vite-Middleware...');
await setupVite(app, server);

// Starte Server
const port = process.env.PORT || 5000;
server.listen({
  port: parseInt(port),
  host: "0.0.0.0",
  reusePort: true,
}, () => {
  console.log(`✅ Server läuft auf Port ${port}`);
  console.log('🎯 Deployment-Fix erfolgreich angewendet!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM empfangen - Server herunterfahren...');
  server.close(() => {
    console.log('✅ Server erfolgreich heruntergefahren');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT empfangen - Server herunterfahren...');
  server.close(() => {
    console.log('✅ Server erfolgreich heruntergefahren');
    process.exit(0);
  });
});