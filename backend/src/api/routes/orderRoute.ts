import express from 'express';
import { placeOrder, cancelOrder, getOrders } from '../controllers/orders';
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();
router.use(authenticate);

router.post('/', placeOrder);
router.get('/', getOrders);
router.delete('/:orderId', cancelOrder);

export default router;
