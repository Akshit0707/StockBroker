import dotenv from "dotenv";
import { db } from ".";
import { query } from "../utils/db";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

export const Database = async () => {
  try {
    await db();
    console.log("Database loaded.");

    const existingStocks = await query("SELECT COUNT(*) as count FROM stocks");
    if (existingStocks.rows[0].count > 0) {
      console.log(
        "Stocks already exist in database. Skipping mock data insertion.",
      );
      return;
    }

    const stocks = [
      { symbol: "AAPL", name: "Apple Inc.", price: 189.5 },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.8 },
      { symbol: "MSFT", name: "Microsoft Corporation", price: 374.2 },
      { symbol: "TSLA", name: "Tesla Inc.", price: 248.9 },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.3 },
      { symbol: "NVDA", name: "NVIDIA Corporation", price: 495.0 },
      { symbol: "META", name: "Meta Platforms Inc.", price: 358.7 },
      { symbol: "NFLX", name: "Netflix Inc.", price: 485.2 },
    ];
    const insertedStockIds: Record<string, string> = {};
    for (const stock of stocks) {
      const stockId = uuidv4(); 
      const result = await query(
        'INSERT INTO stocks (id, symbol, name, "currentPrice", "previousClose") VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [stockId, stock.symbol, stock.name, stock.price, stock.price],
      );
      insertedStockIds[stock.symbol] = result.rows[0].id; 
      console.log(`Inserted stocks: ${stock.symbol}`);
    }

    const now = new Date();

    for (const stock of stocks) {
      const stockId = insertedStockIds[stock.symbol];
      for (let i = 0; i < 30; i++) {
        const priceFluctuation = (Math.random() - 0.5) * 20;
        const price =
          Math.round(Math.max(1, stock.price + priceFluctuation) * 100) / 100;
        const openPrice = parseFloat(
          (price + (Math.random() - 0.5) * 10).toFixed(2),
        );
        const highPrice = parseFloat(
          (Math.max(price, openPrice) + Math.random() * 10).toFixed(2),
        );
        const lowPrice = parseFloat(
          (Math.min(price, openPrice) - Math.random() * 10).toFixed(2),
        );
        const volume = Math.floor(Math.random() * 10000);

        const ts = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

        await query(
          "INSERT INTO price_history (stock_id, price, open_price, high_price, low_price, volume, time, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [stockId, price, openPrice, highPrice, lowPrice, volume, ts, ts],
        );
      }
      console.log(`Inserted price history for stock: ${stock.symbol}`);
    }
    console.log("Mock data insertion complete!");
  } catch (error) {
    console.error("Error loading database:", error);
    process.exit(1);
  }
};
