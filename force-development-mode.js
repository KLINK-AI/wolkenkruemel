/**
 * FORCE DEVELOPMENT MODE IN PRODUCTION
 * This ensures setupVite() is used instead of serveStatic()
 */

// Set NODE_ENV to development to trigger setupVite()
process.env.NODE_ENV = 'development';

// Force app.get("env") to return "development"
const originalGet = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';

console.log('🔧 Forcing development mode for production deployment');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);

// Start the server with forced development mode
require('tsx/esm/loader');
import('./server/index.js').then(() => {
  console.log('✅ Server started with forced development mode');
}).catch(err => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});