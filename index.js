// Vercel serverless function at root level
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  return res.json({
    status: 'OK - Root level serverless function working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    environment: process.env.NODE_ENV || 'production',
    hasDatabase: !!process.env.DATABASE_URL,
    vercel: true
  });
}