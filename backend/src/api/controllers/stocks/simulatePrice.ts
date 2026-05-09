import type { Request, Response } from 'express';
import { StockModel } from '../../models';
import { publish } from '../../../redis';

export const simulatePriceTick = async (req: Request, res: Response): Promise<void> => {
  const db = await import('../../../utils/db');
  const client = await db.default.connect();

  try {
    const { symbol } = req.params;
    const stock = await StockModel.findBySymbol(symbol);

    if (!stock) {
      res.status(404).json({ success: false, message: 'Stock not found' });
      return;
    }

    const currentPrice = Number(stock.current_price);
    const changePercent = (Math.random() - 0.5) * 0.04;
    const newPrice = Math.max(0.01, currentPrice * (1 + changePercent));
    const roundedPrice = parseFloat(newPrice.toFixed(2));

    await client.query('BEGIN');

    await StockModel.updatePrice(stock.id, roundedPrice, client);
    await StockModel.insertPriceHistory(
      {
        stockId: stock.id,
        price: roundedPrice,
        volume: Math.floor(Math.random() * 10000),
      },
      client,
    );

    await client.query('COMMIT');

    await publish('price_update', {
      symbol: stock.symbol,
      price: roundedPrice,
      change: (roundedPrice - currentPrice).toFixed(2),
      changePercent: (changePercent * 100).toFixed(2),
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        oldPrice: currentPrice,
        newPrice: roundedPrice,
        change: (roundedPrice - currentPrice).toFixed(2),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Price tick error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};