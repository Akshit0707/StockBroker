import type { Request, Response } from 'express';
import { StockModel } from '../../models';
import { setCache, getCache } from '../../../redis';
import type { Stock } from '../../types';

export const getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock:${symbol.toUpperCase()}`;
    const cached = await getCache<Stock>(cacheKey);

    if (cached) {
      res.json({ success: true, data: cached, fromCache: true });
      return;
    }

    const stock = await StockModel.findBySymbol(symbol);

    if (!stock) {
      res.status(404).json({ success: false, message: `Stock ${symbol} not found` });
      return;
    }

    await setCache(cacheKey, stock, 5);
    res.json({ success: true, data: stock });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};