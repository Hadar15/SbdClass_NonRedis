import { query, withTransaction } from '../db.js';
import { io } from '../index.js';
const PROMOTION_WINDOW_MS = 60 * 1000;
const getWaitingPosition = async (eventId, createdAt) => {
    const result = await query('SELECT COUNT(*)::int AS count FROM queue_entries WHERE event_id = $1 AND status = $2 AND created_at <= $3', [eventId, 'WAITING', createdAt]);
    return result.rows[0]?.count ?? 0;
};
const getWaitingCount = async (eventId) => {
    const result = await query('SELECT COUNT(*)::int AS count FROM queue_entries WHERE event_id = $1 AND status = $2', [eventId, 'WAITING']);
    return result.rows[0]?.count ?? 0;
};
export const joinQueue = async (eventId, userId) => {
    const existingResult = await query('SELECT id, status, promotion_expires_at, created_at FROM queue_entries WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
    if (existingResult.rowCount && existingResult.rowCount > 0) {
        const existing = existingResult.rows[0];
        const promotionExpiresAt = existing.promotion_expires_at;
        if (existing.status === 'PROMOTED' && promotionExpiresAt && promotionExpiresAt > new Date()) {
            return { status: 'promoted', alreadyInQueue: true };
        }
        if (existing.status === 'PROMOTED' && promotionExpiresAt && promotionExpiresAt <= new Date()) {
            await query('UPDATE queue_entries SET status = $1, promotion_expires_at = NULL, updated_at = now() WHERE id = $2', ['WAITING', existing.id]);
            const position = await getWaitingPosition(eventId, existing.created_at);
            return { status: 'waiting', position, alreadyInQueue: true };
        }
        if (existing.status === 'WAITING') {
            const position = await getWaitingPosition(eventId, existing.created_at);
            return { status: 'waiting', position, alreadyInQueue: true };
        }
        return { status: 'done', alreadyInQueue: true };
    }
    const insertResult = await query('INSERT INTO queue_entries (event_id, user_id, status, created_at, updated_at) VALUES ($1, $2, $3, now(), now()) RETURNING created_at', [eventId, userId, 'WAITING']);
    const createdAt = insertResult.rows[0]?.created_at;
    const position = await getWaitingPosition(eventId, createdAt);
    const queueLength = await getWaitingCount(eventId);
    io.to(`event:${eventId}`).emit('queue_update', { eventId, queueLength });
    return { status: 'waiting', position, alreadyInQueue: false };
};
export const getQueueStatus = async (eventId, userId) => {
    const entryResult = await query('SELECT id, status, promotion_expires_at, created_at FROM queue_entries WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
    if (entryResult.rowCount === 0)
        return { status: 'not_in_queue' };
    const entry = entryResult.rows[0];
    const promotionExpiresAt = entry.promotion_expires_at;
    if (entry.status === 'PROMOTED' && promotionExpiresAt && promotionExpiresAt > new Date()) {
        return { status: 'promoted' };
    }
    if (entry.status === 'PROMOTED' && promotionExpiresAt && promotionExpiresAt <= new Date()) {
        await query('UPDATE queue_entries SET status = $1, promotion_expires_at = NULL, updated_at = now() WHERE id = $2', ['WAITING', entry.id]);
        const position = await getWaitingPosition(eventId, entry.created_at);
        return { status: 'waiting', position };
    }
    if (entry.status === 'WAITING') {
        const position = await getWaitingPosition(eventId, entry.created_at);
        return { status: 'waiting', position };
    }
    return { status: 'done' };
};
export const expirePromotions = async () => {
    await query('UPDATE queue_entries SET status = $1, promotion_expires_at = NULL, updated_at = now() WHERE status = $2 AND promotion_expires_at < now()', ['WAITING', 'PROMOTED']);
};
export const promoteFromQueue = async (eventId, count = 5) => {
    const now = new Date();
    const promotionExpiresAt = new Date(now.getTime() + PROMOTION_WINDOW_MS);
    const waiting = await withTransaction(async (client) => {
        const waitingResult = await client.query('SELECT id, user_id FROM queue_entries WHERE event_id = $1 AND status = $2 ORDER BY created_at ASC LIMIT $3 FOR UPDATE SKIP LOCKED', [eventId, 'WAITING', count]);
        if (waitingResult.rowCount === 0)
            return [];
        const ids = waitingResult.rows.map((row) => row.id);
        await client.query('UPDATE queue_entries SET status = $1, promotion_expires_at = $2, updated_at = now() WHERE id = ANY($3::uuid[])', ['PROMOTED', promotionExpiresAt, ids]);
        return waitingResult.rows;
    });
    if (waiting.length === 0)
        return [];
    for (const entry of waiting) {
        io.to(`event:${eventId}`).emit('user_promoted', { userId: entry.user_id, eventId });
    }
    const remaining = await getWaitingCount(eventId);
    io.to(`event:${eventId}`).emit('queue_update', { eventId, queueLength: remaining });
    return waiting.map((entry) => entry.user_id);
};
//# sourceMappingURL=queueService.js.map