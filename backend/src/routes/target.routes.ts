import { Router } from 'express';
import { createTarget, getActiveTargets, contributeToTarget } from '../controllers/target.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// [POST] /api/targets/
router.post('/', createTarget);

// [GET] /api/targets/
router.get('/', getActiveTargets);

// [POST] /api/targets/contribute
router.post('/contribute', contributeToTarget);

export default router;