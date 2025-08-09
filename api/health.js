export default function handler(req, res) {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    hasDatabase: !!process.env.DATABASE_URL,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    vercel: true
  });
}