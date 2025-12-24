import { Router } from 'express';
import { getCategories, getMethods } from '../controllers/utility.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); 

router.get('/categories', getCategories);
router.get('/methods', getMethods);     

export default router;