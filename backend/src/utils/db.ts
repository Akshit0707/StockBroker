import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const useUrl = Boolean(process.env.DATABASE_URL);

const pool = new Pool(
  useUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.DB_HOST || 'postgres',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'stock_app',
      }
);

console.log(
  'Connecting to PostgreSQL with config:',
  useUrl
    ? { mode: 'DATABASE_URL' }
    : {
        host: process.env.DB_HOST || 'postgres',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        database: process.env.DB_NAME || 'stock_app',
      }
);

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;