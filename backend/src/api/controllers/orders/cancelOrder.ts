import type { Response } from 'express';
import { OrderModel } from '../../models';
import type { AuthRequest } from '../../types';

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const cancelled = await OrderModel.cancelOrder(orderId, userId);

    if (!cancelled) {
      res.status(404).json({
        success: false,
        message: 'Order not found or cannot be cancelled',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: cancelled,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};