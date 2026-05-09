import type { Response } from 'express';
import { PortfolioModel, UserModel } from '../../models';
import type { AuthRequest } from '../../types';

export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const holdings = await PortfolioModel.getUserPortfolio(userId);

    const cashBalance = Number(user.balance ?? 0); // paise
    const totalInvested = holdings.reduce(
      (sum: number, h: any) => sum + Number(h.averageBuyPrice ?? 0) * Number(h.quantity ?? 0),
      0
    );
    const holdingsValue = holdings.reduce(
      (sum: number, h: any) => sum + Number(h.currentPrice ?? 0) * Number(h.quantity ?? 0),
      0
    );

    const totalValue = cashBalance + holdingsValue;
    const totalPL = holdingsValue - totalInvested;
    const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        cashBalance: Number(user?.balance ?? 0),
        totalValue,
        totalInvested,
        totalPL,
        totalPLPercent,
        holdings,
      },
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio' });
  }
};