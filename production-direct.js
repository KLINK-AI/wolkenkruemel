#!/usr/bin/env node

/**
 * Direct production deployment - bypasses build issues
 * Uses the working development server directly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Creating direct production deployment...');

// Clean and prepare
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Step 1: Copy the working server files directly
console.log('📁 Copying server files...');
const serverFiles = [
  'server/index.ts',
  'server/routes.ts', 
  'server/storage.ts',
  'server/db.ts',
  'server/sendgrid.ts',
  'server/vite.ts'
];

const serverDir = path.join(distDir, 'server');
fs.mkdirSync(serverDir, { recursive: true });

serverFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(distDir, file));
  }
});

// Step 2: Copy shared directory
console.log('📁 Copying shared files...');
const sharedDir = path.join(__dirname, 'shared');
if (fs.existsSync(sharedDir)) {
  fs.cpSync(sharedDir, path.join(distDir, 'shared'), { recursive: true });
}

// Step 3: Copy client directory for static serving
console.log('📁 Copying client files...');
const clientDir = path.join(__dirname, 'client');
if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, path.join(distDir, 'client'), { recursive: true });
}

// Step 4: Create production package.json
console.log('📦 Creating production package.json...');
const originalPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const productionPackage = {
  ...originalPackage,
  scripts: {
    start: "NODE_ENV=production tsx server/index.ts",
    dev: "NODE_ENV=development tsx server/index.ts"
  }
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(productionPackage, null, 2));

// Step 5: Create production environment file
console.log('🔧 Creating production environment...');
const envContent = `NODE_ENV=production
DATABASE_URL=${process.env.DATABASE_URL}
STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}
VITE_STRIPE_PUBLIC_KEY=${process.env.VITE_STRIPE_PUBLIC_KEY}
SESSION_SECRET=wolkenkruemel-production-secret
`;

fs.writeFileSync(path.join(distDir, '.env'), envContent);

// Step 6: Create production start script
console.log('🎯 Creating production start script...');
const startScript = `#!/usr/bin/env node

/**
 * Production start script for Wolkenkrümel
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Wolkenkrümel production server...');

// Start the server using tsx (same as development but in production mode)
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

// Handle server lifecycle
server.on('close', (code) => {
  console.log(\`Server process exited with code \${code}\`);
  process.exit(code);
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.kill('SIGINT');
});
`;

fs.writeFileSync(path.join(distDir, 'start.js'), startScript);

// Step 7: Create production HTML with proper fallback
console.log('🌐 Creating production HTML...');
const publicDir = path.join(distDir, 'public');
fs.mkdirSync(publicDir, { recursive: true });

const productionHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wolkenkrümel - Hundetraining Community</title>
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
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .loading { font-size: 1rem; opacity: 0.8; margin-bottom: 1rem; }
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
    setTimeout(() => {
      window.location.href = '/activities';
    }, 3000);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), productionHtml);

// Step 8: Create deployment info
console.log('📊 Creating deployment info...');
const deploymentInfo = {
  type: 'direct_production',
  timestamp: new Date().toISOString(),
  environment: 'production',
  method: 'tsx_direct',
  database: !!process.env.DATABASE_URL,
  stripe: !!process.env.STRIPE_SECRET_KEY,
  version: '1.0.0-direct'
};

fs.writeFileSync(path.join(distDir, 'deployment-info.json'), JSON.stringify(deploymentInfo, null, 2));

console.log('✅ Direct production deployment created successfully!');
console.log('');
console.log('📁 Files created in dist/:');
console.log('   - server/ (all TypeScript files)');
console.log('   - shared/ (schema and types)');
console.log('   - client/ (frontend files)');
console.log('   - package.json (production config)');
console.log('   - .env (production environment)');
console.log('   - start.js (production starter)');
console.log('   - public/index.html (fallback)');
console.log('');
console.log('🎯 Ready for deployment!');
console.log('This bypasses all build issues by using tsx directly in production.');