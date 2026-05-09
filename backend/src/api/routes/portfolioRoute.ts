import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/portfolio', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId || decoded.sub;
    if (!userId) return res.status(400).json({ success: false, message: 'Invalid token' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const holdings = await prisma.portfolio.findMany({
      where: { userId },
      include: { stock: true },
    });

    let totalInvested = 0;
    let totalValue = 0;

    const holdingsSerialized = holdings.map((h: any) => {
      const avgPrice = Number(h.averageBuyPrice) / 100;
      const currentPrice = Number(h.stock?.currentPrice ?? 0) ;
      const invested = avgPrice * h.quantity;
      const value = currentPrice * h.quantity;

      totalInvested += invested;
      totalValue += value;

      return {
        id: h.id,
        stockId: h.stockId,
        symbol: h.stock?.symbol,
        name: h.stock?.name,
        quantity: h.quantity,
        averageBuyPrice: avgPrice,
        currentPrice,
        value,
        pl: value - invested,
        plPercent: invested > 0 ? (((value - invested) / invested) * 100) : 0,
      };
    });

    const cashBalance = Number(user.balance) / 100;
    const totalPL = totalValue - totalInvested;
    const totalPLPercent = totalInvested > 0 ? ((totalPL / totalInvested) * 100) : 0;

    return res.json({
      success: true,
      data: {
        cashBalance,
        totalValue: totalValue + cashBalance,
        totalInvested,
        totalPL,
        totalPLPercent,
        holdings: holdingsSerialized,
      }
    });

  } catch (err: any) {
    console.error('GET /api/portfolio error:', err.message, err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

export default router;