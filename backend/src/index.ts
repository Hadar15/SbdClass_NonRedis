import './env.js';
import express from 'express';
import cors from 'cors';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'TicketFlash Backend API' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', (req, res, next) => {
  import('./routes/api.js')
    .then((m) => m.default(req, res, next))
    .catch((err) => {
      console.error('Error loading API routes:', err);
      res.status(500).json({ error: 'Failed to load API routes', message: err.message });
    });
});

// Default export must be a function (handler) or server instance for Vercel.
export default function handler(req: any, res: any) {
  return app(req, res);
}





