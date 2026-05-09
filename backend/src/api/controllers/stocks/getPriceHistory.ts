import type { Request, Response } from 'express';
import { StockModel } from '../../models';
import type { OhlcCandle } from '../../types';

export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '1h';
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

    const stock = await StockModel.findBySymbol(symbol);

    if (!stock) {
      res.status(404).json({ success: false, message: 'Stock not found' });
      return;
    }

    const candles = await StockModel.getPriceHistory(stock.id, interval, limit);

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        interval,
        candles: candles as OhlcCandle[],
      },
    });
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};