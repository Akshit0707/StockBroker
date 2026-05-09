import { query } from '../../utils/db';
import type { OrderType } from '../types';

export interface OrderRow {
  id: string;
  userId: string;
  stockId: string;
  stockSymbol: string;
  stockName: string;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Orders {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  price: number;
  orderType: 'buy' | 'sell';
  status: 'pending' | 'completed' | 'cancelled' | 'partially_filled';
  createdAt: Date;
  updatedAt: Date;
  filledQuantity: number;
}

export interface OrderInput {
  userId: string;
  stockId: string;
  quantity: number;
  price: number;
  orderType: 'buy' | 'sell';
}

export class OrderModel {
  static async findById(id: string): Promise<Orders | null> {
    const result = await query(
      `SELECT
         id,
         user_id AS "userId",
         stock_id AS "stockId",
         quantity,
         price,
         order_type AS "orderType",
         status,
         filled_quantity AS "filledQuantity",
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM orders
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async create(
    userId: string,
    stockId: string,
    orderType: 'buy' | 'sell',
    price: number,
    quantity: number,
    status: string = 'pending',
  ): Promise<Orders> {
    const result = await query(
      `INSERT INTO orders (
        user_id,
        stock_id,
        order_type,
        price,
        quantity,
        status,
        filled_quantity,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 0, NOW(), NOW())
      RETURNING *`,
      [userId, stockId, orderType, price, quantity, status],
    );

    return result.rows[0];
  }

  static async findMatchingOrders(
    stockId: string,
    oppositeType: OrderType,
    price: number,
    currentOrderId: string,
  ): Promise<Orders[]> {
    const priceCondition = oppositeType === 'buy' ? '>=' : '<=';
    const priceSort = oppositeType === 'buy' ? 'DESC' : 'ASC';

    const result = await query(
      `SELECT
         id,
         user_id AS "userId",
         stock_id AS "stockId",
         quantity,
         price,
         order_type AS "orderType",
         status,
         filled_quantity AS "filledQuantity",
         created_at timestamptz not NULL DEFAULT NOW(),
         updated_at timestamptz not NULL DEFAULT NOW()
       FROM orders
       WHERE stock_id = $1
         AND order_type = $2
         AND (status = 'pending' OR status = 'partially_filled')
         AND price ${priceCondition} $3
         AND id != $4
       ORDER BY price ${priceSort}, created_at ASC`,
      [stockId, oppositeType, price, currentOrderId],
    );
    return result.rows;
  }

  static async updateFilledQuantity(orderId: string, filledQuantity: number): Promise<Orders> {
    const result = await query(
      `UPDATE orders
       SET filled_quantity = filled_quantity + $1,
           status = CASE
             WHEN filled_quantity + $1 >= quantity THEN 'completed'
             ELSE 'partially_filled'
           END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         user_id AS "userId",
         stock_id AS "stockId",
         quantity,
         price,
         order_type AS "orderType",
         status,
         filled_quantity AS "filledQuantity",
         created_at timestamptz not NULL DEFAULT NOW(),
         updated_at timestamptz not NULL DEFAULT NOW()`,
      [filledQuantity, orderId],
    );
    return result.rows[0];
  }

  static async cancelOrder(orderId: string, userId: string): Promise<OrderRow | null> {
    const result = await query(
      `UPDATE orders
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status IN ('pending', 'partially_filled')
       RETURNING
         id,
         user_id AS "userId",
         stock_id AS "stockId",
         order_type AS "orderType",
         quantity,
         COALESCE(filled_quantity, 0) AS "filledQuantity",
         price,
         status,
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [orderId, userId],
    );

    return (result.rows[0] as OrderRow) ?? null;
  }

  static async getUserOrders(userId: string): Promise<OrderRow[]> {
    const result = await query(
      `SELECT
         o.id,
         o.user_id AS "userId",
         o.stock_id AS "stockId",
         s.symbol AS "stockSymbol",
         s.name AS "stockName",
         o.order_type AS "orderType",
         o.quantity,
         COALESCE(o.filled_quantity, 0) AS "filledQuantity",
         o.price,
         o.status,
         o.created_at AS "createdAt",
         o.updated_at AS "updatedAt"
       FROM orders o
       JOIN stocks s ON s.id = o.stock_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId],
    );

    return result.rows as OrderRow[];
  }
}