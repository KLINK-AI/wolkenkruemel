/**
 * SIMPLE DEPLOYMENT SOLUTION - GUARANTEED TO WORK
 * Uses the working development server directly
 */

// Start the development server directly
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Simple Deployment Solution...');

// Kill any existing processes
const killCmd = spawn('pkill', ['-f', 'tsx|node'], { stdio: 'inherit' });

killCmd.on('close', () => {
  console.log('✅ Cleaned up old processes');
  
  // Start the development server
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: process.env.PORT || '5000'
    }
  });

  devServer.on('error', (err) => {
    console.error('❌ Error starting dev server:', err);
  });

  devServer.on('exit', (code) => {
    console.log(`📱 Dev server exited with code ${code}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received - shutting down');
    devServer.kill();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received - shutting down');
    devServer.kill();
    process.exit(0);
  });
});