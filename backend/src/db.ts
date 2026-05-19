import './env.js';
import { Pool } from 'pg';
import type { PoolClient, QueryResult } from 'pg';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
	console.error('Unexpected PG client error:', err);
});

export type Queryable = {
	query: (text: string, params?: any[]) => Promise<QueryResult>;
};

export const query = (text: string, params?: any[]) => {
	return pool.query(text, params);
};

export const withTransaction = async <T>(fn: (client: PoolClient) => Promise<T>) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const result = await fn(client);
		await client.query('COMMIT');
		return result;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
};

export default pool;
