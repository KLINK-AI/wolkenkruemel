export default function handler(req, res) {
  res.json({ message: 'Hello from Vercel Serverless Function!', timestamp: new Date().toISOString() });
}