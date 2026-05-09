import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany();
    return res.json({ success: true, data: stocks });
  } catch (err) {
    console.error('GET /api/stocks error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;