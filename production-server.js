import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { registerRoutes } from './server/routes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lade Environment-Variablen
config();

// Erstelle Express-App
const app = express();
const PORT = process.env.PORT || 5000;

// Setze Environment für Production
process.env.NODE_ENV = 'production';

console.log('🚀 Starte Production-Server...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🌐 Port:', PORT);

// Middleware für Static Files
app.use(express.static(path.join(__dirname, 'dist')));

// Registriere API-Routen
const server = await registerRoutes(app);

// Fallback für React-Router (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Starte Server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Production-Server läuft auf Port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Beende Server...');
    server.close(() => {
        console.log('✅ Server beendet');
        process.exit(0);
    });
});