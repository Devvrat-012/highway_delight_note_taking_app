import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get user profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', userController.updateProfile);

// DELETE /api/users/account - Delete user account
router.delete('/account', userController.deleteAccount);

export default router;
