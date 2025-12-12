import { Router } from 'express';
import { updateProfile, updatePassword } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // Lindungi semua endpoint user

router.put('/profile', updateProfile); // PUT /api/users/profile
router.put('/password', updatePassword); // PUT /api/users/password

export default router;