import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // For development, you can use services like Gmail, SendGrid, etc.
      // For production, use a proper email service
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_SERVICE_API_KEY
      }
    });
  }

  public async sendOtpEmail(email: string, otp: string, type: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET'): Promise<void> {
    try {
      const subject = this.getEmailSubject(type);
      const html = this.getEmailTemplate(otp, type);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html
      });

    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  private getEmailSubject(type: string): string {
    switch (type) {
      case 'SIGNUP':
        return 'Highway Delight - Verify Your Account';
      case 'LOGIN':
        return 'Highway Delight - Login Verification';
      case 'PASSWORD_RESET':
        return 'Highway Delight - Password Reset';
      default:
        return 'Highway Delight - Verification Code';
    }
  }

  private getEmailTemplate(otp: string, type: string): string {
    const action = type === 'SIGNUP' ? 'verify your account' : 
                   type === 'LOGIN' ? 'login to your account' : 'reset your password';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Highway Delight - Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #367AFF;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #367AFF;
          }
          .content {
            padding: 30px 0;
            text-align: center;
          }
          .otp-container {
            background: #F3F4F6;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            display: inline-block;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #367AFF;
            letter-spacing: 4px;
          }
          .footer {
            padding: 20px 0;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            Highway Delight
          </div>
        </div>
        
        <div class="content">
          <h1>Verification Code</h1>
          <p>Use the following code to ${action}:</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        
        <div class="footer">
          <p>© 2025 Highway Delight. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </body>
      </html>
    `;
  }
}
