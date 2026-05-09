import type { Response } from 'express';
import { UserModel, StockModel, OrderModel, PortfolioModel } from '../../models';
import { runMatchingEngine } from '../../services/matchingEngine';
import type { AuthRequest, OrderType } from '../../types';

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stockSymbol, orderType, price, quantity } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!stockSymbol || !orderType || price == null || quantity == null) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const normalizedType = String(orderType).toLowerCase() as OrderType;
    if (!['buy', 'sell'].includes(normalizedType)) {
      res.status(400).json({ success: false, message: 'orderType must be buy or sell' });
      return;
    }

    const qty = Number(quantity);
    const priceInPaise = Math.round(Number(price)); // <-- price already in paise from stocks API

    if (priceInPaise <= 0 || qty <= 0) {
      res.status(400).json({ success: false, message: 'Price and quantity must be positive' });
      return;
    }

    const stock = await StockModel.findBySymbol(stockSymbol);
    if (!stock) {
      res.status(404).json({ success: false, message: `Stock ${stockSymbol} not found` });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const userBalancePaise = Number(user.balance);

    if (normalizedType === 'buy') {
      const totalCostPaise = priceInPaise * qty;
      if (userBalancePaise < totalCostPaise) {
        res.status(400).json({
          success: false,
          message: `Insufficient balance. Need ₹${(totalCostPaise / 100).toFixed(2)}, have ₹${(userBalancePaise / 100).toFixed(2)}`,
        });
        return;
      }
    }

    if (normalizedType === 'sell') {
      const portfolio = await PortfolioModel.findByUserAndStock(userId, stock.id);
      const ownedQty = portfolio?.quantity ?? 0;

      if (ownedQty < qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient shares. Want to sell ${qty}, own ${ownedQty}`,
        });
        return;
      }
    }

    const order = await OrderModel.create(userId, stock.id, normalizedType, priceInPaise, qty);
    await runMatchingEngine(order.id, stock.id, normalizedType, priceInPaise, qty);

    res.status(201).json({
      success: true,
      message: `${normalizedType.toUpperCase()} order placed successfully`,
      data: order,
    });
  } catch (error: any) {
    console.error('Place order error:', error);

    res.status(error?.status || 500).json({
      success: false,
      message: error?.message ?? 'Failed to place order',
      ...(process.env.NODE_ENV !== 'production' ? { error: String(error) } : {}),
    });
  }
};