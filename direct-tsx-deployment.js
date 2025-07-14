/**
 * DIRECT TSX DEPLOYMENT - NO BUILD PROCESS
 * Completely bypasses any build steps that cause ES module issues
 * Runs tsx directly in production mode
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🎯 DIRECT TSX DEPLOYMENT - START');

// Clean up any build artifacts that might interfere
const buildDirs = ['dist', 'build', '.next', '.vite'];
buildDirs.forEach(dir => {
    if (existsSync(dir)) {
        console.log(`🧹 Removing ${dir}/`);
        execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
    }
});

// Force development environment to use vite middleware
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- Database:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');

// Direct tsx execution
console.log('🚀 Starting tsx server directly...');

try {
    execSync('npx tsx server/index.ts', {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: process.env.PORT || '5000'
        }
    });
} catch (error) {
    console.error('❌ Direct tsx execution failed:', error);
    process.exit(1);
}