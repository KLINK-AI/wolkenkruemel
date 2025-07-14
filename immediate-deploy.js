#!/usr/bin/env node

/**
 * SOFORTIGE DEPLOYMENT-LÖSUNG
 * Behebt das Problem, dass Deploy-Button nicht funktioniert
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

console.log('🚀 SOFORTIGE DEPLOYMENT-LÖSUNG');
console.log('💡 Verwendet tsx direkt in Production');
console.log('🔧 Umgeht alle Build-Probleme');

// Production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('\n📊 Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Database:', process.env.DATABASE_URL ? 'Connected' : 'Missing');

// Test development API first
async function testDevelopmentAPI() {
    console.log('\n🧪 Testing Development API...');
    
    try {
        // Start development server briefly to test
        const testServer = spawn('tsx', ['server/index.ts'], {
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: 'development',
                PORT: '5001'
            }
        });
        
        let output = '';
        testServer.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        testServer.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        setTimeout(() => {
            testServer.kill();
            
            if (output.includes('serving on port')) {
                console.log('✅ Development server starts successfully');
                startProductionServer();
            } else {
                console.log('❌ Development server failed');
                console.log('Output:', output);
                process.exit(1);
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

function startProductionServer() {
    console.log('\n🚀 Starting Production Server...');
    
    const server = spawn('tsx', ['server/index.ts'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: process.env.PORT || '5000'
        }
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('\n🛑 SIGTERM received - shutting down...');
        server.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
        console.log('\n🛑 SIGINT received - shutting down...');
        server.kill('SIGINT');
    });
    
    server.on('close', (code) => {
        console.log(`\n📊 Server closed with code: ${code}`);
        process.exit(code);
    });
    
    server.on('error', (error) => {
        console.error('\n❌ Server error:', error);
        process.exit(1);
    });
}

// Start the process
testDevelopmentAPI();