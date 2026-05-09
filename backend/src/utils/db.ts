import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const poolConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'stock_app',
  connectionTimeoutMillis: 10000,
};

if (process.env.DB_PASSWORD) {
  poolConfig.password = process.env.DB_PASSWORD;
}

console.log('Connecting to PostgreSQL with config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  user: poolConfig.user,
  database: poolConfig.database,
});

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Pool error:', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;