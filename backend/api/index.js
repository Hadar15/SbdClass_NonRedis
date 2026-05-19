import app from '../src/index.js';

// Vercel serverless function entrypoint
// Export a request handler that delegates to the Express app.
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
