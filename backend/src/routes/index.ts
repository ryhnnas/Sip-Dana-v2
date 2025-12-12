import { Router } from 'express';
import authRoutes from './auth.routes';
import reportRoutes from './report.routes';
import transactionRoutes from './transaction.routes';
import targetRoutes from './target.routes'; // <-- Import routes baru

const router = Router();

router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/transactions', transactionRoutes);
router.use('/targets', targetRoutes); // <-- Daftarkan routes baru

export default router;