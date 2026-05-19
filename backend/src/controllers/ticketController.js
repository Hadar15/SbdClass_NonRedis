import * as ticketService from '../services/ticketService.js';
import * as queueService from '../services/queueService.js';
export const joinQueue = async (req, res) => {
    try {
        const { eventId, userId } = req.body;
        const result = await queueService.joinQueue(eventId, userId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getQueueStatus = async (req, res) => {
    try {
        const { eventId, userId } = req.query;
        const result = await queueService.getQueueStatus(eventId, userId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const reserveTicket = async (req, res) => {
    try {
        const { eventId, userId } = req.body;
        // Check if user is allowed to reserve (from queue promotion)
        // For simplicity in this demo, we might skip the strict check or implement it
        const canReserve = await (process.env.STRICT_QUEUE === 'true' ?
            ticketService.reserveTicket(eventId, userId) :
            ticketService.reserveTicket(eventId, userId));
        res.json(canReserve);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const confirmPayment = async (req, res) => {
    try {
        const { eventId, userId } = req.body;
        const result = await ticketService.confirmPayment(eventId, userId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const getTicketStatus = async (req, res) => {
    try {
        const { eventId, userId } = req.query;
        const result = await ticketService.getTicketStatus(eventId, userId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=ticketController.js.map