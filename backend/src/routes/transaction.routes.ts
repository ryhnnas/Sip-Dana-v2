import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createTransaction);


export default router;