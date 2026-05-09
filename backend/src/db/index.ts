import dotenv from 'dotenv';
import { query } from '../utils/db';

dotenv.config();

export const db = async (): Promise<void> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful');

    await query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;').catch(() => {
      console.log('TimescaleDB already exists or not available');
    });

    await query(`CREATE TABLE IF NOT EXISTS users(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      balance BIGINT DEFAULT 10000000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS stocks(
  id TEXT PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  "currentPrice" DOUBLE PRECISION,
  "openPrice" DOUBLE PRECISION,
  "previousClose" DOUBLE PRECISION,
  "changePercent" DOUBLE PRECISION,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

await query(`
  CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    stock_id TEXT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    open_price NUMERIC,
    high_price NUMERIC,
    low_price NUMERIC,
    volume BIGINT,
    time TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

await query(`CREATE TABLE IF NOT EXISTS orders(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id TEXT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  order_type VARCHAR(4) NOT NULL CHECK (order_type IN ('buy', 'sell')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_filled', 'completed', 'cancelled')),
  price BIGINT NOT NULL,
  quantity INT NOT NULL,
  filled_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

await query(`CREATE TABLE IF NOT EXISTS trades(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sell_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stock_id TEXT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  price BIGINT NOT NULL,
  quantity INT NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

await query(`CREATE TABLE IF NOT EXISTS portfolio(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id TEXT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  average_buy_price BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, stock_id)
)`);


    await query(
      `CREATE INDEX IF NOT EXISTS idx_orders_stock_status ON orders(stock_id, status)`,
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`,
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_trades_stock ON trades(stock_id)`,
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at DESC)`,
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio(user_id)`,
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_price_history_stock ON price_history(stock_id)`,
    );

    console.log('Database tables created successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
};

