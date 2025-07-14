/**
 * EINFACHER BUILD-PROZESS
 * Kopiert nur die notwendigen Dateien ohne komplexe Transformationen
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🎯 SIMPLE BUILD PROCESS - START');

// 1. Cleanup
console.log('🧹 Cleanup...');
if (existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
}
mkdirSync('dist', { recursive: true });

// 2. Environment zwingend auf development
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('✅ Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// 3. Erstelle einfachen Server-Starter
const serverStarter = `
// Simple server starter - forces development mode
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

import { spawn } from 'child_process';

console.log('🚀 Starting development server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(\`🔚 Server exited with code: \${code}\`);
    process.exit(code);
});

process.on('SIGTERM', () => server.kill('SIGTERM'));
process.on('SIGINT', () => server.kill('SIGINT'));
`;

writeFileSync('dist/server.js', serverStarter);

console.log('✅ Build completed - simple development server created');
console.log('🚀 Starting server...');

// 4. Starte den Server
try {
    execSync('node dist/server.js', {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: process.env.PORT || '5000'
        }
    });
} catch (error) {
    console.error('❌ Server start failed:', error);
    process.exit(1);
}