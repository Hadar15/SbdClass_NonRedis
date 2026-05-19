import './env.js';
import { Pool } from 'pg';
import type { PoolClient, QueryResult } from 'pg';
declare const pool: Pool;
export type Queryable = {
    query: (text: string, params?: any[]) => Promise<QueryResult>;
};
export declare const query: (text: string, params?: any[]) => Promise<QueryResult<any>>;
export declare const withTransaction: <T>(fn: (client: PoolClient) => Promise<T>) => Promise<T>;
export default pool;
//# sourceMappingURL=db.d.ts.map