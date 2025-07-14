/**
 * DEPLOYMENT FORCE VITE - PATCHES EXPRESS APP.GET("ENV")
 * Forces setupVite() by overriding app.get("env") to return "development"
 */

const express = require('express');
const originalExpress = express;

// Patch Express to force development mode
function patchedExpress() {
  const app = originalExpress();
  
  // Override app.get("env") to always return "development"
  const originalGet = app.get.bind(app);
  app.get = function(setting) {
    if (setting === 'env') {
      return 'development';
    }
    return originalGet(setting);
  };
  
  return app;
}

// Replace express with our patched version
require.cache[require.resolve('express')] = {
  exports: patchedExpress,
  loaded: true,
  filename: require.resolve('express')
};

console.log('🔧 Patched Express to force development mode');
console.log('📊 app.get("env") will now return: development');

// Start the server with patched Express
const { spawn } = require('child_process');

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`📱 Server exited with code: ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM - shutting down');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT - shutting down');
  server.kill('SIGINT');
});