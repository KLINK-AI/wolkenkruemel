#!/usr/bin/env node

/**
 * DEPLOYMENT DIAGNOSTIC - ANALYSE DER PRODUCTION-UMGEBUNG
 * Findet den genauen Unterschied zwischen lokaler und deployment Umgebung
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

console.log('🔍 DEPLOYMENT DIAGNOSTIC');
console.log('📊 Analysiere Unterschiede zwischen lokal und deployment');
console.log('');

// 1. Environment Analysis
console.log('📋 1. ENVIRONMENT ANALYSIS:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Present' : '❌ Missing');
console.log('');

// 2. File Structure Analysis
console.log('📁 2. FILE STRUCTURE ANALYSIS:');
const criticalPaths = [
    'server/index.ts',
    'server/routes.ts', 
    'server/storage.ts',
    'server/db.ts',
    'server/vite.ts',
    'shared/schema.ts',
    'client/index.html',
    'client/src/main.tsx',
    'package.json',
    '.env'
];

criticalPaths.forEach(path => {
    if (existsSync(path)) {
        console.log(`✅ ${path}`);
    } else {
        console.log(`❌ ${path} MISSING`);
    }
});
console.log('');

// 3. Directory Structure Check
console.log('📂 3. DIRECTORY STRUCTURE:');
const directories = ['client', 'server', 'shared', 'dist', 'public', 'build'];
directories.forEach(dir => {
    if (existsSync(dir)) {
        const files = readdirSync(dir).slice(0, 5); // First 5 files
        console.log(`✅ ${dir}/ (${files.length} files): ${files.join(', ')}`);
    } else {
        console.log(`❌ ${dir}/ MISSING`);
    }
});
console.log('');

// 4. Database Connection Test
console.log('🗄️ 4. DATABASE CONNECTION TEST:');
try {
    const { storage } = await import('./server/storage.js');
    console.log('✅ Storage module loaded');
    
    const users = await storage.getAllUsers();
    console.log(`✅ Database connected: ${users.length} users found`);
    
    const activities = await storage.getActivities(5, 0);
    console.log(`✅ Activities query works: ${activities.length} activities found`);
    
    if (activities.length > 0) {
        console.log(`✅ Sample activity: "${activities[0].title}"`);
    }
} catch (error) {
    console.log('❌ Database connection failed:', error.message);
}
console.log('');

// 5. API Route Test
console.log('🚀 5. API ROUTE TEST:');
const server = spawn('tsx', ['server/index.ts'], {
    stdio: 'pipe',
    env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: '5001'
    }
});

let serverStarted = false;
server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('serving on port')) {
        serverStarted = true;
        console.log('✅ Server started successfully');
        
        // Test API endpoint
        setTimeout(async () => {
            try {
                const response = await fetch('http://localhost:5001/api/activities');
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ API works: ${data.length} activities returned`);
                } else {
                    console.log(`❌ API failed: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ API request failed: ${error.message}`);
            }
            
            server.kill();
        }, 2000);
    }
});

server.stderr.on('data', (data) => {
    console.log('❌ Server error:', data.toString().trim());
});

server.on('close', (code) => {
    console.log('');
    console.log('📊 DIAGNOSTIC SUMMARY:');
    console.log('Server Exit Code:', code);
    console.log('Server Started:', serverStarted ? '✅ Yes' : '❌ No');
    console.log('');
    
    if (serverStarted) {
        console.log('💡 LOKAL FUNKTIONIERT - DEPLOYMENT PROBLEM');
        console.log('Mögliche Ursachen:');
        console.log('- Deployment verwendet andere Node.js Version');
        console.log('- Deployment hat andere Environment-Variablen');
        console.log('- Deployment fehlen Build-Artefakte');
        console.log('- Deployment hat andere Dateiberechtigungen');
    } else {
        console.log('💡 LOKAL FUNKTIONIERT NICHT - CODE PROBLEM');
        console.log('Server startet nicht einmal lokal');
    }
});

// Stop after 10 seconds if server doesn't start
setTimeout(() => {
    if (!serverStarted) {
        console.log('⏰ Timeout - Server didn\'t start in 10 seconds');
        server.kill();
    }
}, 10000);