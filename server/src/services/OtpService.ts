import { prisma } from '../index';
import { EmailService } from './EmailService';

export class OtpService {
  private emailService = new EmailService();

  public async generateAndSendOtp(
    email: string, 
    type: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET',
    userId?: string
  ): Promise<void> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Invalidate any existing OTPs for this email and type
      await prisma.otpToken.updateMany({
        where: {
          email,
          type,
          used: false
        },
        data: {
          used: true
        }
      });

      // Create new OTP token
      await prisma.otpToken.create({
        data: {
          email,
          token: otp,
          type,
          expiresAt,
          userId
        }
      });

      // Send OTP email
      await this.emailService.sendOtpEmail(email, otp, type);
    } catch (error) {
      console.error('Error generating and sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  public async verifyOtp(
    email: string, 
    otp: string, 
    type: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET'
  ): Promise<boolean> {
    try {
      const otpToken = await prisma.otpToken.findFirst({
        where: {
          email,
          token: otp,
          type,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!otpToken) {
        return false;
      }

      // Mark OTP as used
      await prisma.otpToken.update({
        where: { id: otpToken.id },
        data: { used: true }
      });

      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  public async cleanupExpiredOtps(): Promise<void> {
    try {
      await prisma.otpToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}
