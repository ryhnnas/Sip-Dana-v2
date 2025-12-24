import { Router } from 'express';
import { getMonthlySummary, getTransactionHistory, getHistoricalData, getAnalysisReport } from '../controllers/report.controller'; 
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/summary', getMonthlySummary); 
router.get('/history', getTransactionHistory); 
router.get('/historical', getHistoricalData); 
router.get('/analysis', getAnalysisReport); 

export default router;