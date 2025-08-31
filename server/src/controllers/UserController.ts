import { Response } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest } from '../middleware/auth';

// Local types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

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

export class UserController {
  public getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          dateOfBirth: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        return res.status(404).json(response);
      }

      const formattedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        dateOfBirth: user.dateOfBirth || undefined,
        avatar: user.avatar || undefined,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: formattedUser
      });
    } catch (error) {
      console.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve profile'
      };
      res.status(500).json(response);
    }
  };

  public updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, dateOfBirth, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(avatar && { avatar })
        },
        select: {
          id: true,
          email: true,
          name: true,
          dateOfBirth: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      const formattedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        dateOfBirth: user.dateOfBirth || undefined,
        avatar: user.avatar || undefined,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: formattedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update profile'
      };
      res.status(500).json(response);
    }
  };

  public deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Delete user account (notes will be deleted due to cascade)
      await prisma.user.delete({
        where: { id: userId }
      });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete account'
      };
      res.status(500).json(response);
    }
  };
}
