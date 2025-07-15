#!/usr/bin/env node

/**
 * DIREKTER TEST DER 22:20 CET KONFIGURATION
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { config } from 'dotenv';

config();

console.log('🧪 Direct test of Sunday 22:20 CET configuration...');

async function testDirectConfiguration() {
    // Test 1: Can we access database?
    console.log('\n📊 Test 1: Database Connection...');
    
    try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`SELECT COUNT(*) as count FROM activities`;
        console.log('✅ Database works:', result[0].count, 'activities');
    } catch (error) {
        console.log('❌ Database error:', error.message);
    }
    
    // Test 2: Can we start Express server?
    console.log('\n📊 Test 2: Express Server...');
    
    const testServer = `
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html><body><h1>TEST SERVER WORKS</h1><p>Time: ' + new Date().toLocaleString() + '</p></body></html>');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
    console.log('✅ Test server running on port', port);
});
`;
    
    writeFileSync('test-server.cjs', testServer);
    
    // Test 3: Can we import server files?
    console.log('\n📊 Test 3: Import server files...');
    
    try {
        const serverIndex = await import('./server/index.js');
        console.log('✅ server/index.js imports successfully');
    } catch (error) {
        console.log('❌ server/index.js import error:', error.message);
        
        try {
            const serverIndexTs = await import('./server/index.ts');
            console.log('✅ server/index.ts imports successfully');
        } catch (tsError) {
            console.log('❌ server/index.ts import error:', tsError.message);
        }
    }
    
    // Test 4: Environment check
    console.log('\n📊 Test 4: Environment...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('PORT:', process.env.PORT || '5000');
    
    console.log('\n🚀 Starting minimal test server...');
    
    const testServerProcess = spawn('node', ['test-server.cjs'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: '5000'
        }
    });
    
    testServerProcess.on('error', (error) => {
        console.error('❌ Test server error:', error);
    });
    
    testServerProcess.on('close', (code) => {
        console.log(`📊 Test server closed with code: ${code}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => testServerProcess.kill('SIGTERM'));
    process.on('SIGINT', () => testServerProcess.kill('SIGINT'));
}

testDirectConfiguration().catch(console.error);