import type { Request, Response } from 'express';
import TradeModel from '../../models/trade';
import { setCache, getCache } from '../../../redis';

export const getUserTrades = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id ?? String(req.query.userId ?? '');
    if (!userId) {
      res.status(400).json({ success: false, message: 'Missing user id' });
      return;
    }

    const cacheKey = `user_trades:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached, fromCache: true });
      return;
    }

    const rows = await TradeModel.getUserTrades(userId, 5).catch((e) => {
      console.error('getUserTrades model error:', e);
      return [];
    });

    const normalized = (Array.isArray(rows) ? rows : [])
      .filter(Boolean)
      .map((r: any) => {
        const qty = Number(r.quantity ?? r.qty ?? 0);
        const price = Number(r.price ?? 0);
        return {
          id: r.id,
          symbol: r.symbol ?? '—',
          side: r.side ?? (qty < 0 ? 'SELL' : 'BUY'),
          quantity: Math.abs(qty),
          price,
          total: Number(r.total ?? (price * qty)),
          status: r.status ?? 'filled',
          executed_at: r.executed_at ?? r.created_at ?? null,
        };
      });

    await setCache(cacheKey, normalized, 5);
    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error('getUserTrades controller error:', err);
    res.status(500).json({ success: false, message: 'Failed to load user trades', error: String(err) });
  }
};