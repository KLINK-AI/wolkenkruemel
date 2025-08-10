import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

let app;

// Initialize Express app with basic setup
function createApp() {
  const expressApp = express();
  
  // Basic middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));
  
  // Health check
  expressApp.get('/api/health', (req, res) => {
    res.json({
      status: 'OK - Express on Vercel Serverless',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      hasDatabase: !!process.env.DATABASE_URL,
      hasStripe: !!process.env.STRIPE_SECRET_KEY
    });
  });
  
  // Simple activity endpoint
  expressApp.get('/api/activities', (req, res) => {
    res.json({
      success: true,
      message: 'Activities endpoint working',
      activities: [],
      count: 0
    });
  });
  
  // Serve static files from dist/public
  const publicPath = join(__dirname, '../dist/public');
  if (fs.existsSync(publicPath)) {
    expressApp.use(express.static(publicPath));
    
    // SPA fallback
    expressApp.get('*', (req, res) => {
      const indexPath = join(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Frontend not found', path: indexPath });
      }
    });
  } else {
    expressApp.get('*', (req, res) => {
      res.status(404).json({ 
        error: 'Static files not found', 
        expectedPath: publicPath,
        available: fs.readdirSync(join(__dirname, '..'))
      });
    });
  }
  
  return expressApp;
}

// Vercel serverless handler
export default function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  
  return app(req, res);
}