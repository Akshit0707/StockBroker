import type { Request, Response } from 'express';
import TradeModel from '../../models/trade';
import { setCache, getCache } from '../../../redis';

const inferSide = (r: any) => {
  if (!r) return 'BUY';
  const candidates = [
    r.side,
    r.trade_side,
    r.type,
    r.action,
    r.order_side,
    r.orderType,
    r.order_type,
    r.tradeType,
    r.buy_sell,
    r.buySell,
    r.direction,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== '') {
      const v = String(c).trim().toLowerCase();
      if (v.includes('sell') || v === 's' || v === 'short') return 'SELL';
      if (v.includes('buy') || v === 'b' || v === 'long') return 'BUY';
    }
  }

  if (r.is_buy === true || r.isBuy === true || r.buy === true) return 'BUY';
  if (r.is_sell === true || r.isSell === true || r.sell === true) return 'SELL';

  const qty = Number(r.quantity ?? r.qty ?? 0);
  if (Number.isFinite(qty) && qty < 0) return 'SELL';
  const total = Number(r.total ?? r.total_value ?? 0);
  if (Number.isFinite(total) && total < 0) return 'SELL';

  return 'BUY';
};

export const getAllTrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'trades_recent';
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached, fromCache: true });
      return;
    }

    const rows = await TradeModel.getAllTrades(100).catch((err) => {
      console.error('getAllTrades model error:', err);
      return [];
    });

    const normalized = (Array.isArray(rows) ? rows : [])
      .filter(Boolean)
      .map((r: any) => {
        const qty = Number(r.quantity ?? r.qty ?? 0);
        const price = Number(r.price ?? 0);
        return {
          id: r.id,
          symbol: r.symbol ?? r.stock_symbol ?? '',
          side: inferSide(r),
          quantity: Math.abs(qty),
          price,
          total: Number(r.total ?? r.total_value ?? price * qty),
          status: r.status ?? 'filled',
          executed_at: r.executed_at ?? r.created_at ?? null,
          raw: r,
        };
      });

    await setCache(cacheKey, normalized, 10);
    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error('getAllTrades controller error:', err);
    res.status(500).json({ success: false, message: 'Failed to load trades' });
  }
};