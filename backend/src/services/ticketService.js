import { query, withTransaction } from '../db.js';
const HOLD_WINDOW_MS = 5 * 60 * 1000;
const mapTransactionRow = (row) => ({
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    status: row.status,
    seatDetails: row.seat_details,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});
const getRemainingStock = async (db, eventId) => {
    const eventResult = await db.query('SELECT total_stock FROM events WHERE id = $1', [eventId]);
    if (eventResult.rowCount === 0)
        throw new Error('Event not found');
    const paidResult = await db.query('SELECT COUNT(*)::int AS count FROM transactions WHERE event_id = $1 AND status = $2', [eventId, 'PAID']);
    const pendingResult = await db.query('SELECT COUNT(*)::int AS count FROM transactions WHERE event_id = $1 AND status = $2 AND expires_at > now()', [eventId, 'PENDING']);
    const totalStock = Number(eventResult.rows[0]?.total_stock ?? 0);
    const paidCount = Number(paidResult.rows[0]?.count ?? 0);
    const pendingCount = Number(pendingResult.rows[0]?.count ?? 0);
    const remaining = totalStock - paidCount - pendingCount;
    return remaining < 0 ? 0 : remaining;
};
export const reserveTicket = async (eventId, userId) => {
    const result = await withTransaction(async (client) => {
        if (process.env.STRICT_QUEUE === 'true') {
            const promotionResult = await client.query('SELECT status, promotion_expires_at FROM queue_entries WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
            const promotion = promotionResult.rows[0];
            const isPromoted = promotion &&
                promotion.status === 'PROMOTED' &&
                promotion.promotion_expires_at &&
                promotion.promotion_expires_at > new Date();
            if (!isPromoted) {
                throw new Error('You must wait in the queue before reserving.');
            }
        }
        const existingResult = await client.query('SELECT id FROM transactions WHERE event_id = $1 AND user_id = $2 AND (status = $3 OR (status = $4 AND expires_at > now())) LIMIT 1', [eventId, userId, 'PAID', 'PENDING']);
        if (existingResult.rowCount && existingResult.rowCount > 0) {
            throw new Error('You already have a ticket reserved. Please complete payment.');
        }
        const remaining = await getRemainingStock(client, eventId);
        if (remaining <= 0) {
            throw new Error('Sold out!');
        }
        const expiresAt = new Date(Date.now() + HOLD_WINDOW_MS);
        const insertResult = await client.query('INSERT INTO transactions (user_id, event_id, status, expires_at, created_at, updated_at) VALUES ($1, $2, $3, $4, now(), now()) RETURNING id, expires_at', [userId, eventId, 'PENDING', expiresAt]);
        await client.query('UPDATE queue_entries SET status = $1, promotion_expires_at = NULL, updated_at = now() WHERE event_id = $2 AND user_id = $3 AND status = $4', ['DONE', eventId, userId, 'PROMOTED']);
        return { expiresAt: insertResult.rows[0]?.expires_at };
    });
    return {
        success: true,
        message: 'Ticket reserved! You have 5 minutes to pay.',
        expiresAt: result.expiresAt.getTime(),
    };
};
export const confirmPayment = async (eventId, userId) => {
    const transaction = await withTransaction(async (client) => {
        const existingResult = await client.query('SELECT id FROM transactions WHERE event_id = $1 AND user_id = $2 AND status = $3 AND expires_at > now() ORDER BY created_at DESC LIMIT 1', [eventId, userId, 'PENDING']);
        if (existingResult.rowCount === 0) {
            throw new Error('Reservation expired or not found.');
        }
        const updatedResult = await client.query('UPDATE transactions SET status = $1, updated_at = now() WHERE id = $2 RETURNING *', ['PAID', existingResult.rows[0].id]);
        return mapTransactionRow(updatedResult.rows[0]);
    });
    return { success: true, transaction };
};
export const getTicketStatus = async (eventId, userId) => {
    const existingResult = await query('SELECT expires_at FROM transactions WHERE event_id = $1 AND user_id = $2 AND status = $3 AND expires_at > now() ORDER BY created_at DESC LIMIT 1', [eventId, userId, 'PENDING']);
    if (existingResult.rowCount === 0)
        return { status: 'none' };
    const expiresAt = existingResult.rows[0]?.expires_at;
    if (!expiresAt)
        return { status: 'none' };
    const remainingTime = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    return { status: 'held', remainingTime };
};
export const expireReservations = async () => {
    await query('UPDATE transactions SET status = $1, updated_at = now() WHERE status = $2 AND expires_at < now()', ['EXPIRED', 'PENDING']);
};
export const getEventStock = async (eventId) => {
    return getRemainingStock({ query }, eventId);
};
//# sourceMappingURL=ticketService.js.map