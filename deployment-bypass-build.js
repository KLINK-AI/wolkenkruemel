/**
 * DEPLOYMENT BYPASS BUILD SOLUTION
 * Completely bypasses the build process that causes ES module issues
 * Uses tsx directly without any compilation steps
 */

console.log('🎯 DEPLOYMENT BYPASS BUILD - START');

// Force environment to development
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('Environment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

// Import and start the server using tsx directly
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting server with tsx (bypassing build)...');

// Use tsx directly to run the server
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: process.env.PORT || '5000'
    }
});

// Handle process events
serverProcess.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`🔚 Server exited with code: ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received - shutting down gracefully');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received - shutting down gracefully');
    serverProcess.kill('SIGINT');
});

console.log('✅ DEPLOYMENT BYPASS BUILD - Server started successfully');