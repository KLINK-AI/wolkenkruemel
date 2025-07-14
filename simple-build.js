#!/usr/bin/env node

/**
 * EINFACHER BUILD-PROZESS
 * Kopiert nur die notwendigen Dateien ohne komplexe Transformationen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🏗️ EINFACHER BUILD-PROZESS');
console.log('📦 Bereite echte Wolkenkrümel-App für Deployment vor');

// Erstelle dist-Ordner
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

// Kopiere wichtige Dateien
const filesToCopy = [
    'package.json',
    'package-lock.json',
    '.env'
];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join('dist', file));
        console.log(`✅ Kopiert: ${file}`);
    }
});

// Kopiere Ordner
const dirsToCopy = [
    'server',
    'client',
    'shared',
    'node_modules'
];

dirsToCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.cpSync(dir, path.join('dist', dir), { recursive: true });
        console.log(`✅ Kopiert: ${dir}/`);
    }
});

console.log('✅ Build abgeschlossen');
console.log('📂 Alle Dateien in dist/ bereit');
console.log('🚀 Bereit für Deployment mit echter App');