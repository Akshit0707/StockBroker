import { query } from '../../utils/db';

export class TradeModel {
  static async getAllTrades(limit = 100) {
    const q = `
      SELECT
        t.*,
        COALESCE(s.symbol, '') AS symbol
      FROM trades t
      LEFT JOIN stocks s ON s.id = t.stock_id
      ORDER BY COALESCE(t.executed_at, t.created_at, now()) DESC
      LIMIT $1
    `;
    const result = await query(q, [limit]);
    return result.rows;
  }

  static async findById(id: string) {
    const q = `
      SELECT t.*, COALESCE(s.symbol, '') AS symbol
      FROM trades t
      LEFT JOIN stocks s ON s.id = t.stock_id
      WHERE t.id = $1
      LIMIT 1
    `;
    const result = await query(q, [id]);
    return result.rows[0] ?? null;
  }

  static async getUserTrades(userId: string, limit = 5) {
    const q = `
      SELECT
        t.*,
        COALESCE(s.symbol, '') AS symbol
      FROM trades t
      LEFT JOIN stocks s ON s.id = t.stock_id
      WHERE t.user_id = $1
      ORDER BY COALESCE(t.executed_at, t.created_at, now()) DESC
      LIMIT $2
    `;
    const result = await query(q, [userId, limit]);
    return result.rows;
  }
}

export default TradeModel;