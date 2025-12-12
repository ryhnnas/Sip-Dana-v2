import { Router } from 'express';
// FIX: Tambahkan getAnalysisReport
import { getMonthlySummary, getTransactionHistory, getHistoricalData, getAnalysisReport } from '../controllers/report.controller'; 
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/summary', getMonthlySummary); 
router.get('/history', getTransactionHistory); 
router.get('/historical', getHistoricalData); 
router.get('/analysis', getAnalysisReport); // <-- Rute Baru untuk Analisis

export default router;