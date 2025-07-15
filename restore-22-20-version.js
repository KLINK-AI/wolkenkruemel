#!/usr/bin/env node

/**
 * WIEDERHERSTELLUNG DER 22:20 CET VERSION
 * Die letzte funktionierende Version vor den Deployment-Problemen
 */

import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { config } from 'dotenv';

config();

console.log('🔄 Wiederherstellung der 22:20 CET Version...');

// Cleanup
console.log('🧹 Cleanup old builds...');
if (existsSync('dist')) rmSync('dist', { recursive: true });
if (existsSync('build')) rmSync('build', { recursive: true });

// Create the EXACT server that worked on Sunday
const sundayServer = `#!/usr/bin/env node

/**
 * DIREKTE WIEDERHERSTELLUNG - WIE ES UM 22:20 CET FUNKTIONIERTE
 * Verwendet tsx direkt ohne komplexe Builds
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

console.log('🚀 Starting Sunday 22:20 CET configuration...');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('📊 PORT:', process.env.PORT || 5000);

// Start server exactly like on Sunday
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || '5000'
    }
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(\`📊 Server closed with code: \${code}\`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received');
    server.kill('SIGINT');
});

console.log('✅ Sunday 22:20 CET server started');
`;

writeFileSync('direct-start.js', sundayServer);

console.log('✅ Sunday 22:20 CET server configuration restored');
console.log('✅ Based on: tsx server/index.ts (exactly like on Sunday)');
console.log('✅ Expected behavior: React app loads, Activities API might have 500 errors');
console.log('📊 This matches the working pattern from Sunday screenshots');