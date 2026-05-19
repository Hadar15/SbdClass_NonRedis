import './env.js';
import express from 'express';
import cors from 'cors';
export const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://sbd-class-non-redis.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error('CORS blocked'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'TicketFlash Backend API' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api', (req, res) => res.json({ status: 'ok', message: 'API root' }));
app.use('/api', (req, res, next) => {
    import('./routes/api.js')
        .then((m) => m.default(req, res, next))
        .catch((err) => {
        console.error('Error loading API routes:', err);
        res.status(500).json({ error: 'Failed to load API routes', message: err.message });
    });
});
// Default export must be a function (handler) or server instance for Vercel.
export default function handler(req, res) {
    return app(req, res);
}
//# sourceMappingURL=index.js.map