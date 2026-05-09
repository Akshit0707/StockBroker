import { redisClient } from "../../redis";
import { query } from "../../utils/db";

export const startPriceUpdater = () => {
  setInterval(async () => {
    try {
      const stocks = await query('SELECT id, "currentPrice", "previousClose" FROM stocks');

      for (const stock of stocks.rows) {
        const fluctuation = (Math.random() - 0.5) * 0.04;
        const newPrice = parseFloat((stock.currentPrice * (1 + fluctuation)).toFixed(2));

        const changePercent = stock.previousClose
          ? parseFloat((((newPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2))
          : 0;

        await query(
          'UPDATE stocks SET "currentPrice" = $1, "previousClose" = "currentPrice", "changePercent" = $2 WHERE id = $3',
          [newPrice, changePercent, stock.id]
        );

        await query(
          `INSERT INTO price_history (stock_id, time, price, open_price, high_price, low_price, volume)
           VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
          [
            stock.id,
            newPrice,
            parseFloat((newPrice * 0.99).toFixed(2)),
            parseFloat((newPrice * 1.01).toFixed(2)),
            parseFloat((newPrice * 0.98).toFixed(2)),
            Math.floor(Math.random() * 50000),
          ]
        );

        await redisClient.publish(`stock:${stock.id}`, JSON.stringify({
          stockId: stock.id,
          price: newPrice,
          changePercent,
          timestamp: new Date(),
        }));
      }

      console.log("Prices updated successfully");
    } catch (error) {
      console.error("Error updating prices:", error);
    }
  }, 60000);
};