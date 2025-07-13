#!/usr/bin/env node

/**
 * Production setup script for Wolkenkrümel deployment
 * This script ensures proper production configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

console.log('🚀 Starting production setup...');

// Ensure dist directory structure exists
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created dist/public directory');
}

// Create a minimal index.html if it doesn't exist
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const minimalHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wolkenkrümel - Hundetraining Community</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
    .loading { color: #666; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Wolkenkrümel</h1>
  <div class="loading">Wird geladen...</div>
  <script>
    // Redirect to activities after a brief delay
    setTimeout(() => {
      window.location.href = '/activities';
    }, 1000);
  </script>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, minimalHtml);
  console.log('✅ Created minimal index.html');
}

// Verify database connection environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is missing');
  process.exit(1);
}

console.log('✅ Database URL configured');

// Verify Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is missing');
  process.exit(1);
}

console.log('✅ Stripe configuration verified');

// Log environment status
console.log(`📊 Environment: ${process.env.NODE_ENV}`);
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`📁 Dist directory: ${distDir}`);
console.log(`📁 Public directory: ${publicDir}`);

console.log('🎉 Production setup complete!');