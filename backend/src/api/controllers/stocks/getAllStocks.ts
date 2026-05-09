import type { Request, Response } from 'express';
import { StockModel } from '../../models';
import { setCache, getCache } from '../../../redis';
import type { Stock } from '../../types';

const normalizeStock = (stock: any): Stock => {
  const price = Number(stock.price ?? stock.current_price ?? stock.currentPrice ?? 0);
  const change = Number(
    stock.change ??
      stock.price_change ??
      stock.change_amount ??
      stock.changeAmount ??
      0,
  );

  const prev = Number(stock.prev_price ?? stock.previous_close ?? stock.previousClose ?? 0);

  const explicitRaw =
    stock.change_percent ?? stock.changePercent ?? stock.change_percentage ?? stock.changePercentage;
  const explicit = explicitRaw !== undefined && explicitRaw !== null ? Number(explicitRaw) : NaN;

  let computedPercent: number;
  if (prev && prev !== 0) {
    computedPercent = (change / prev) * 100;
  } else if (Number.isFinite(explicit)) {
    computedPercent = explicit;
  } else {
    computedPercent = 0;
  }

  return {
    ...stock,
    price,
    change,
    changePercent: Number(computedPercent.toFixed(2)),
  };
};

export const getAllStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'all_stocks';
    const cached = await getCache<Stock[]>(cacheKey);

    if (cached) {
      console.log('[getAllStocks] returning cached stocks, count=', cached.length);
      res.json({ success: true, data: cached, fromCache: true });
      return;
    }


    let stocks = await StockModel.getAllStocks().catch((err) => {
      console.error('[getAllStocks] StockModel.getAllStocks error:', err);
      return null;
    });

    if (!Array.isArray(stocks) || stocks.length === 0) {
      console.log('[getAllStocks] getAllStocks returned empty, trying StockModel.findAll()');
      stocks = await (StockModel as any).findAll?.().catch((err: any) => {
        console.error('[getAllStocks] StockModel.findAll error:', err);
        return [];
      });
    }

    const normalizedStocks = Array.isArray(stocks) ? stocks.map(normalizeStock) : [];

    console.log('[getAllStocks] db stocks count=', (stocks && (stocks as any).length) ?? 0, 'normalizedCount=', normalizedStocks.length);

    await setCache(cacheKey, normalizedStocks, 10);

    res.json({ success: true, data: normalizedStocks });
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};