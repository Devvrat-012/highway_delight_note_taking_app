import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

// Local types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1];
    // fallback to cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token is required'
      };
      return res.status(401).json(response);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(401).json(response);
    }

    if (!user.isVerified) {
      const response: ApiResponse = {
        success: false,
        message: 'Please verify your email address'
      };
      return res.status(401).json(response);
    }

    req.user = user;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired token'
    };
    res.status(401).json(response);
  }
};
