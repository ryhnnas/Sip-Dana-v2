import { Router } from 'express';
import { getCategories, getMethods } from '../controllers/utility.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // Lindungi semua endpoint utilitas

router.get('/categories', getCategories); // GET /api/utilities/categories
router.get('/methods', getMethods);     // GET /api/utilities/methods

export default router;