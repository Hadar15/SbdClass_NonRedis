import './env.js';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'TicketFlash Backend API' });
});

export default app;
//# sourceMappingURL=index.js.map