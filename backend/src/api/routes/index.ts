import express from 'express';
import authRouter from './authRoute';
import orderRouter from './orderRoute';
import stockRouter from './stockRoute';
import portfolioRouter from './portfolioRoute';
import tradeRouter from './tradeRoute';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/orders', orderRouter);
router.use('/stocks', stockRouter);
router.use('/portfolio', portfolioRouter);
router.use('/trades', tradeRouter);

export default router;