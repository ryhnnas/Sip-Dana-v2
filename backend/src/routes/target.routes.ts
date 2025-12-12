import { Router } from 'express';
import { createTarget, getActiveTargets, contributeToTarget } from '../controllers/target.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // Lindungi semua endpoint target

router.post('/', createTarget);
router.get('/', getActiveTargets);
router.put('/contribute/:id_target', contributeToTarget);

export default router;