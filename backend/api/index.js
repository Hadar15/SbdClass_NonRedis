import { app } from '../src/index.js';

// Vercel serverless function entrypoint delegating to named `app` export.
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
