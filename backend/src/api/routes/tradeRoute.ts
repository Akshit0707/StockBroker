import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/api/trades", async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        buyOrder: { include: { stock: true } },
        sellOrder: { include: { stock: true } },
      },
      orderBy: { executedAt: "desc" },
      take: 50,
    });
    const mapped = trades.map((t: any) => ({
      ...t,
      symbol: t.buyOrder?.stock?.symbol ?? t.sellOrder?.stock?.symbol ?? "—",
    }));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    console.error("GET /api/trades error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

router.get("/api/trades/user", async (req, res) => {
  try {
    const userId = String(req.query.userId || "");
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });

    const trades = await prisma.trade.findMany({
      where: {
        OR: [{ buyOrder: { userId } }, { sellOrder: { userId } }],
      },
      include: {
        buyOrder: { include: { stock: true } },
        sellOrder: { include: { stock: true } },
      },
      orderBy: { executedAt: "desc" },
      take: 100,
    });

    const mapped = trades.map((t: any) => {
      const isBuyer = t.buyOrder?.userId === userId;
      return {
        ...t,
        symbol: t.buyOrder?.stock?.symbol ?? t.sellOrder?.stock?.symbol ?? "—",
        orderType: isBuyer ? "buy" : "sell",
      };
    });

    return res.json({ success: true, data: mapped });
  } catch (err) {
    console.error("GET /api/trades/user error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;
