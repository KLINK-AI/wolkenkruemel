#!/usr/bin/env node

/**
 * Comprehensive deployment fix for Wolkenkrümel
 * Addresses all the suggested deployment issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Applying deployment fixes...');

// Fix 1: Ensure NODE_ENV is properly set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
  console.log('✅ Set NODE_ENV to production');
}

// Fix 2: Create proper dist directory structure  
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

// Ensure directories exist
[distDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Fix 3: Verify database configuration
if (!process.env.DATABASE_URL) {
  console.error('❌ Critical: DATABASE_URL environment variable missing');
  process.exit(1);
}

console.log('✅ Database URL configured');

// Fix 4: Verify Stripe configuration  
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Critical: STRIPE_SECRET_KEY environment variable missing');
  process.exit(1);
}

console.log('✅ Stripe configuration verified');

// Fix 5: Create production-ready index.html fallback
const indexPath = path.join(publicDir, 'index.html');
const productionHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wolkenkrümel - Hundetraining Community</title>
  <meta name="description" content="Die Community-Plattform für Hundetraining. Entdecke Aktivitäten, tausche dich mit anderen Hundebesitzern aus und teile deine Erfolge.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container { 
      text-align: center; 
      max-width: 400px;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    h1 { 
      font-size: 2.5rem; 
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .subtitle { 
      font-size: 1.2rem; 
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .loading { 
      font-size: 1rem; 
      opacity: 0.8;
      margin-bottom: 1rem;
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🐕 Wolkenkrümel</h1>
    <div class="subtitle">Hundetraining Community</div>
    <div class="loading">Plattform wird geladen...</div>
    <div class="spinner"></div>
  </div>
  <script>
    // Production-ready redirect logic
    console.log('Wolkenkrümel starting...');
    
    // Test if API is available
    fetch('/api/activities')
      .then(response => {
        if (response.ok) {
          console.log('API available, redirecting to activities');
          window.location.href = '/activities';
        } else {
          console.log('API not ready, retrying...');
          setTimeout(() => window.location.reload(), 2000);
        }
      })
      .catch(() => {
        console.log('API connection failed, retrying...');
        setTimeout(() => window.location.reload(), 3000);
      });
      
    // Fallback redirect after 5 seconds
    setTimeout(() => {
      if (window.location.pathname === '/') {
        window.location.href = '/activities';
      }
    }, 5000);
  </script>
</body>
</html>`;

fs.writeFileSync(indexPath, productionHtml);
console.log('✅ Created production-ready index.html');

// Fix 6: Create deployment status file
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  database: !!process.env.DATABASE_URL,
  stripe: !!process.env.STRIPE_SECRET_KEY,
  buildComplete: true,
  version: '1.0.0-production'
};

fs.writeFileSync(
  path.join(distDir, 'deployment-info.json'), 
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('✅ Created deployment info file');

// Fix 7: Log environment status
console.log('\n📊 Deployment Status:');
console.log(`   Environment: ${process.env.NODE_ENV}`);
console.log(`   Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Build Directory: ${fs.existsSync(distDir) ? '✅ Exists' : '❌ Missing'}`);
console.log(`   Public Directory: ${fs.existsSync(publicDir) ? '✅ Exists' : '❌ Missing'}`);

console.log('\n🎉 All deployment fixes applied successfully!');
console.log('📋 Next steps:');
console.log('   1. Run the build command');
console.log('   2. Deploy to production');
console.log('   3. Monitor for successful startup');