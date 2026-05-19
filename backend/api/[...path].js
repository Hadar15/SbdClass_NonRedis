import { app } from '../src/index.js';

// Catch-all API route for Vercel: handles /api/* paths
export default async function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Handler error:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}
