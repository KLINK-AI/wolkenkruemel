#!/usr/bin/env node

/**
 * EINFACHER BUILD-PROZESS
 * Kopiert nur die notwendigen Dateien ohne komplexe Transformationen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('📦 Einfacher Build-Prozess...');

// Lösche alten dist Ordner
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}

// Erstelle dist Ordner
fs.mkdirSync('dist', { recursive: true });

// Kopiere alle notwendigen Dateien direkt
const filesToCopy = [
    'server',
    'shared',
    'client',
    'package.json',
    'vite.config.ts',
    'drizzle.config.ts',
    'postcss.config.js',
    'tailwind.config.ts'
];

filesToCopy.forEach(item => {
    const source = path.join(__dirname, item);
    const dest = path.join(__dirname, 'dist', item);
    
    if (fs.existsSync(source)) {
        if (fs.statSync(source).isDirectory()) {
            fs.cpSync(source, dest, { recursive: true });
        } else {
            fs.copyFileSync(source, dest);
        }
        console.log(`✅ Kopiert: ${item}`);
    }
});

// Erstelle Environment-Datei
const envContent = `NODE_ENV=production
PORT=5000
DATABASE_URL=${process.env.DATABASE_URL || ''}
VITE_STRIPE_PUBLIC_KEY=${process.env.VITE_STRIPE_PUBLIC_KEY || ''}
STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY || ''}
`;

fs.writeFileSync('dist/.env', envContent);
console.log('✅ Environment-Datei erstellt');

console.log('🎉 Einfacher Build abgeschlossen!');