import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../index';
import { EmailService } from '../services/EmailService';
import { OtpService } from '../services/OtpService';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: Date;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SignupDto {
  email: string;
  name: string;
  dateOfBirth?: string;
  password?: string;
}

interface LoginDto {
  email: string;
  password?: string;
  otp?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface OtpResponse {
  message: string;
  email: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class AuthController {
  private emailService = new EmailService();
  private otpService = new OtpService();
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  public signup = async (req: Request, res: Response) => {
    try {
      const { email, name, dateOfBirth, password }: SignupDto = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User with this email already exists'
        };
        return res.status(409).json(response);
      }

      // If password is provided, hash it
      let hashedPassword: string | undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          password: hashedPassword,
          isVerified: false
        }
      });

      // Send OTP for verification
      await this.otpService.generateAndSendOtp(email, 'SIGNUP', user.id);

      const response: OtpResponse = {
        message: 'Please check your email for verification code',
        email
      };

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: response
      });
    } catch (error) {
      console.error('Signup error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create user'
      };
      res.status(500).json(response);
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const { email, password, otp }: LoginDto = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid credentials'
        };
        return res.status(401).json(response);
      }

      // Login with password
      if (password) {
        if (!user.password) {
          const response: ApiResponse = {
            success: false,
            message: 'Please use Google sign-in for this account'
          };
          return res.status(400).json(response);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          const response: ApiResponse = {
            success: false,
            message: 'Invalid credentials'
          };
          return res.status(401).json(response);
        }
      }

      // Login with OTP
      if (otp) {
        const isValidOtp = await this.otpService.verifyOtp(email, otp, 'LOGIN');
        if (!isValidOtp) {
          const response: ApiResponse = {
            success: false,
            message: 'Invalid or expired OTP'
          };
          return res.status(401).json(response);
        }
      }

      if (!password && !otp) {
        const response: ApiResponse = {
          success: false,
          message: 'Password or OTP is required'
        };
        return res.status(400).json(response);
      }

      if (!user.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: 'Please verify your email address'
        };
        return res.status(401).json(response);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dateOfBirth: user.dateOfBirth || undefined,
          avatar: user.avatar || undefined,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      };

      // Set auth cookie (httpOnly) — respect remember flag for persistent cookie
      const remember = (req.body && (req.body as any).remember) as boolean | undefined;
      const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      };
      if (remember) {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }
      res.cookie('token', token, cookieOptions);

      res.json({
        success: true,
        message: 'Login successful',
        data: authResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Login failed'
      };
      res.status(500).json(response);
    }
  };

  public sendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        return res.status(404).json(response);
      }

      await this.otpService.generateAndSendOtp(email, 'LOGIN', user.id);

      const response: OtpResponse = {
        message: 'OTP sent to your email',
        email
      };

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: response
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send OTP'
      };
      res.status(500).json(response);
    }
  };

  public verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp, type = 'SIGNUP' } = req.body;

      const isValid = await this.otpService.verifyOtp(email, otp, type);

      if (!isValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid or expired OTP'
        };
        return res.status(400).json(response);
      }

      // Mark user as verified if it's a signup OTP
      if (type === 'SIGNUP') {
        await prisma.user.update({
          where: { email },
          data: { isVerified: true }
        });
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        return res.status(404).json(response);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dateOfBirth: user.dateOfBirth || undefined,
          avatar: user.avatar || undefined,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      };

      // Set auth cookie
      const remember = (req.body && (req.body as any).remember) as boolean | undefined;
      const cookieOptions2: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      };
      if (remember) cookieOptions2.maxAge = 7 * 24 * 60 * 60 * 1000;
      res.cookie('token', token, cookieOptions2);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: authResponse
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'OTP verification failed'
      };
      res.status(500).json(response);
    }
  };

  public googleAuth = async (req: Request, res: Response) => {
    try {
      const { credential, mode = 'login' } = req.body; // mode can be 'login' or 'signup'

      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid Google token'
        };
        return res.status(400).json(response);
      }

      const googleUser: GoogleUser = {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture
      };

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email }
      });

      if (!user) {
        // If mode is 'login' and user doesn't exist, don't create account
        if (mode === 'login') {
          const response: ApiResponse = {
            success: false,
            message: 'No account found with this email address. Please sign up first.'
          };
          return res.status(404).json(response);
        }

        // Create new user only in signup mode
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.id,
            avatar: googleUser.picture,
            isVerified: true // Google users are automatically verified
          }
        });
      } else if (!user.googleId) {
        // Link existing account with Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatar: googleUser.picture || user.avatar,
            isVerified: true
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dateOfBirth: user.dateOfBirth || undefined,
          avatar: user.avatar || undefined,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      };

      // Set auth cookie
      const remember = (req.body && (req.body as any).remember) as boolean | undefined;
      const cookieOptions3: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      };
      if (remember) cookieOptions3.maxAge = 7 * 24 * 60 * 60 * 1000;
      res.cookie('token', token, cookieOptions3);

      res.json({
        success: true,
        message: 'Google authentication successful',
        data: authResponse
      });
    } catch (error) {
      console.error('Google auth error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Google authentication failed'
      };
      res.status(500).json(response);
    }
  };

  // refreshToken endpoint removed — token validation is performed by fetching the profile instead

  public logout = async (req: Request, res: Response) => {
    try {
      // Clear cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Logout failed'
      };
      res.status(500).json(response);
    }
  };
}
