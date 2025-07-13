#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...');
  
  try {
    // Check if server starts
    const { stdout, stderr } = await execAsync('cd dist && timeout 10 node index.js');
    console.log('✅ Server starts successfully');
    
    // Test API endpoints
    const testResult = await execAsync('node debug-production.js');
    console.log('✅ API endpoints working');
    
    console.log('🎉 Deployment verification complete!');
    
  } catch (error) {
    console.error('❌ Deployment verification failed:', error.message);
    process.exit(1);
  }
}

verifyDeployment();
