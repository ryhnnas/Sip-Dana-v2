import { Router } from 'express';
import { updateProfile, updatePassword } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); 

router.put('/profile', updateProfile);
router.put('/password', updatePassword); 

export default router;