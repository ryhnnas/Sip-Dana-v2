import { Router } from 'express';
import { createTarget, getActiveTargets, contributeToTarget } from '../controllers/target.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // Lindungi semua endpoint target dengan middleware auth

// [POST] /api/targets/ - Membuat target baru
router.post('/', createTarget);

// [GET] /api/targets/ - Mengambil daftar target
router.get('/', getActiveTargets);

// [POST] /api/targets/contribute - Menabung ke target
// Diubah dari PUT ke POST agar sinkron dengan Frontend yang memakai api.post
router.post('/contribute', contributeToTarget);

export default router;