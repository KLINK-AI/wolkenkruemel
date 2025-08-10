// Simple test function first
export default function handler(req, res) {
  // Debug response to see what's happening
  return res.json({
    status: 'OK from Vercel Serverless Function',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    hasDatabase: !!process.env.DATABASE_URL,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    vercel: true,
    url: req.url,
    method: req.method,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent']?.substring(0, 50)
    }
  });
}