import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, signupSchema, loginSchema, otpSchema } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

// POST /api/auth/signup - Sign up with email/password
router.post('/signup', validate(signupSchema), authController.signup);

// POST /api/auth/login - Login with email/password
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/send-otp - Send OTP to email
router.post('/send-otp', validate(otpSchema), authController.sendOtp);

// POST /api/auth/verify-otp - Verify OTP and complete signup/login
router.post('/verify-otp', authController.verifyOtp);

// POST /api/auth/google - Google OAuth login
router.post('/google', authController.googleAuth);


// POST /api/auth/logout - Logout (invalidate token)
router.post('/logout', authController.logout);

export default router;
