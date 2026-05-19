import { query } from '../db.js';
import { getEventStock } from '../services/ticketService.js';
const mapEventRow = (row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    priceVIP: Number(row.price_vip),
    priceCAT1: Number(row.price_cat1),
    priceCAT2: Number(row.price_cat2),
    imageUrl: row.image_url,
    totalStock: Number(row.total_stock),
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});
export const getEvents = async (req, res) => {
    try {
        const eventsResult = await query('SELECT * FROM events');
        const events = eventsResult.rows.map(mapEventRow);
        // Enrich with real-time stock from the database
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const stock = await getEventStock(event.id);
            return {
                ...event,
                currentStock: stock,
            };
        }));
        res.json(enrichedEvents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: 'Event ID is required' });
        const eventId = Array.isArray(id) ? id[0] : id;
        if (!eventId)
            return res.status(400).json({ error: 'Event ID is required' });
        const eventResult = await query('SELECT * FROM events WHERE id = $1', [eventId]);
        if (eventResult.rowCount === 0)
            return res.status(404).json({ error: 'Event not found' });
        const event = mapEventRow(eventResult.rows[0]);
        const stock = await getEventStock(eventId);
        res.json({
            ...event,
            currentStock: stock,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const createEvent = async (req, res) => {
    try {
        const { title, description, price, priceVIP, priceCAT1, priceCAT2, imageUrl, totalStock, date } = req.body;
        const parsedPriceVIP = priceVIP ? parseFloat(priceVIP) : 2500000;
        const parsedPriceCAT1 = priceCAT1 ? parseFloat(priceCAT1) : 1500000;
        const parsedPriceCAT2 = priceCAT2 ? parseFloat(priceCAT2) : 800000;
        const basePrice = price ? parseFloat(price) : parsedPriceCAT2;
        const eventResult = await query('INSERT INTO events (title, description, price, price_vip, price_cat1, price_cat2, image_url, total_stock, date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now()) RETURNING *', [
            title,
            description,
            basePrice,
            parsedPriceVIP,
            parsedPriceCAT1,
            parsedPriceCAT2,
            imageUrl,
            parseInt(totalStock),
            new Date(date),
        ]);
        const event = mapEventRow(eventResult.rows[0]);
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=eventController.js.map