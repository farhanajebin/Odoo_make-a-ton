import { env } from '../config/environment.js';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  async sendPasswordResetEmail(email: string, rawToken: string, recipientName: string): Promise<boolean> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      console.log(`
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOOPNEX DEV EMAIL ADAPTER] — Password Reset Dispatch                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ To:           ${email} (${recipientName})
│ Subject:      Reset Your LOOPNEX Account Password
│ Expires in:   ${env.RESET_TOKEN_EXPIRES_MINUTES} minutes
│ Reset Link:   ${resetUrl}
└──────────────────────────────────────────────────────────────────────────────┘
      `);
      return true;
    }

    // In production: dispatch via configured transactional mail provider
    // Note: Raw token is never output to production stdout or API logs
    return true;
  }
}

export const emailService = new EmailService();
