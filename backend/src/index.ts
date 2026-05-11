import dotenv from 'dotenv';
import { db } from './db';
import http from 'http';
import { redisClient } from './redis';
import express from 'express';
import portfolioRouter from './api/routes/portfolioRoute';
import stocksRouter from './api/routes/stockRoute';
import tradesRouter from './api/routes/tradeRoute';
import orderRouter from './api/routes/orderRoute';
import { Database } from './db/mock_data';
import { startPriceUpdater } from './api/services/priceUpdate';
import { initializeWebSocket } from './websocket';
import cors from 'cors';
import authRouter from './api/routes/authRoute';
import path from 'path';

dotenv.config();
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://trade-suite.up.railway.app',
  ],
  credentials: true,
}));
app.options('*', cors());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRouter);
app.use(portfolioRouter);             
app.use(stocksRouter);                
app.use(tradesRouter);
app.use('/api/orders', orderRouter);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/_next/static/index.html'), (err) => {
    if (err) res.status(404).json({ success: false, message: 'Not found' });
  });
});

const startServer = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await db();
    console.log('Database connected successfully.');

    console.log('Adding sample stocks...');
    await Database();
    console.log('Sample stocks added successfully.');

    console.log('Starting price updater...');
    startPriceUpdater();
    console.log('Price updater started successfully.');

    console.log('Connecting to Redis...');
    await redisClient.ping();
    console.log('Redis connected successfully.');

    const server = http.createServer(app);
    initializeWebSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await redisClient.quit();
        console.log('Shutdown complete.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(err?.status || 500).json({
    success: false,
    message: err?.message ?? 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { error: String(err) } : {}),
  });
});

startServer();
