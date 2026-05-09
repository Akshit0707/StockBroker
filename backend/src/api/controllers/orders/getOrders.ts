import type { Response } from 'express';
import { OrderModel } from '../../models';
import type { AuthRequest } from '../../types';

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const orders = await OrderModel.getUserOrders(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};