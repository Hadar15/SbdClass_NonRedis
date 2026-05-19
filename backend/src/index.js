import './env.js';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'TicketFlash Backend API' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', (req, res, next) => {
    import('./routes/api.js')
        .then((m) => m.default(req, res, next))
        .catch(next);
});

export default app;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map