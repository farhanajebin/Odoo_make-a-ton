import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../services/store.service.js';
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateCryptoToken,
  hashToken,
} from '../utils/security.js';
import { emailService } from '../services/email.service.js';
import { env } from '../config/environment.js';
import { sendSuccess, sendError } from '../utils/response.js';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------
const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must contain at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string(),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions to register',
    }),
    role: z.string().optional(), // In case an attacker tries to inject role
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// -----------------------------------------------------------------------------
// Controller Handlers
// -----------------------------------------------------------------------------

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body);

    // Validate password complexity
    const passwordCheck = validatePasswordStrength(validated.password);
    if (!passwordCheck.isValid) {
      sendError(res, passwordCheck.error!, 400, 'WEAK_PASSWORD');
      return;
    }

    // Check if email already registered
    const existing = await store.findUserByEmail(validated.email);
    if (existing) {
      sendError(res, 'An account with this email address already exists.', 409, 'EMAIL_ALREADY_EXISTS');
      return;
    }

    // Fetch the customer role (Public registration is strictly CUSTOMER only)
    const customerRole = await store.findRoleByName('CUSTOMER');
    if (!customerRole) {
      sendError(res, 'System role configuration error. Please contact administrator.', 500, 'ROLE_NOT_FOUND');
      return;
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const user = await store.createUser({
      email: validated.email,
      fullName: validated.fullName,
      passwordHash,
      roleId: customerRole.id,
      isActive: true,
    });

    // Record audit event
    await store.createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: user.id,
      metadata: { role: 'CUSTOMER', email: user.email },
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      fullName: user.fullName,
    });

    const { rawToken: rawRefreshToken, tokenHash: refreshHash } = generateCryptoToken();
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
    await store.createRefreshToken(user.id, refreshHash, refreshExpiry);

    // Set secure HttpOnly cookie
    res.cookie('loopnex_refresh_token', rawRefreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      path: '/',
    });

    sendSuccess(
      res,
      {
        message: 'Account registered successfully',
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.name,
          permissions: user.role.permissions,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await store.findUserByEmail(validated.email);

    if (!user) {
      // Record failed login audit (without revealing non-existence)
      await store.createAuditLog({
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        metadata: { email: validated.email, reason: 'INVALID_CREDENTIALS' },
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });

      sendError(res, 'Invalid email or password combination.', 401, 'INVALID_CREDENTIALS');
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      await store.createAuditLog({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        metadata: { email: validated.email, reason: 'INVALID_CREDENTIALS' },
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });

      sendError(res, 'Invalid email or password combination.', 401, 'INVALID_CREDENTIALS');
      return;
    }

    // Check account status
    if (!user.isActive || user.status !== 'ACTIVE') {
      await store.createAuditLog({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        metadata: { email: validated.email, reason: 'ACCOUNT_DISABLED' },
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });

      sendError(
        res,
        'Your account has been deactivated. Please contact an administrator.',
        403,
        'ACCOUNT_DISABLED'
      );
      return;
    }

    // Update last login
    await store.updateUser(user.id, { lastLoginAt: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      fullName: user.fullName,
    });

    const { rawToken: rawRefreshToken, tokenHash: refreshHash } = generateCryptoToken();
    const durationDays = validated.rememberMe ? 30 : env.REFRESH_TOKEN_EXPIRES_DAYS;
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + durationDays);
    await store.createRefreshToken(user.id, refreshHash, refreshExpiry);

    // Set secure HttpOnly cookie
    res.cookie('loopnex_refresh_token', rawRefreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: durationDays * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Record successful login audit
    await store.createAuditLog({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'AUTH',
      entityId: user.id,
      metadata: { role: user.role.name, email: user.email },
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });

    sendSuccess(res, {
      message: 'Login successful',
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions: user.role.permissions,
        department: user.department,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.loopnex_refresh_token || req.body?.refreshToken;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const tokenRecord = await store.findRefreshToken(tokenHash);
      if (tokenRecord) {
        await store.revokeRefreshToken(tokenRecord.id);
      }
    }

    if (req.user) {
      await store.createAuditLog({
        userId: req.user.id,
        action: 'LOGOUT',
        entityType: 'AUTH',
        entityId: req.user.id,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });
    }

    res.clearCookie('loopnex_refresh_token', { path: '/' });
    res.clearCookie('loopnex_access_token', { path: '/' });

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.loopnex_refresh_token || req.body?.refreshToken;

    if (!rawRefreshToken) {
      sendError(res, 'Refresh token is required.', 401, 'REFRESH_TOKEN_REQUIRED');
      return;
    }

    const tokenHash = hashToken(rawRefreshToken);
    const record = await store.findRefreshToken(tokenHash);

    if (!record) {
      sendError(res, 'Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
      return;
    }

    // Check if token was already revoked
    if (record.revokedAt) {
      // Possible token reuse attempt! Revoke all tokens for this user as safety precaution
      await store.revokeAllUserRefreshTokens(record.userId);
      await store.createAuditLog({
        userId: record.userId,
        action: 'UNAUTHORIZED_ACCESS',
        entityType: 'TOKEN_REUSE',
        metadata: { reason: 'Revoked refresh token reuse detected' },
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });
      sendError(res, 'Refresh token was previously revoked. Please log in again.', 401, 'TOKEN_REVOKED');
      return;
    }

    // Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      await store.revokeRefreshToken(record.id);
      sendError(res, 'Refresh token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
      return;
    }

    const user = await store.findUserById(record.userId);
    if (!user || !user.isActive) {
      sendError(res, 'User account is no longer active.', 403, 'ACCOUNT_DISABLED');
      return;
    }

    // Token rotation: Revoke current token and issue new token pair
    const { rawToken: newRawRefreshToken, tokenHash: newRefreshHash } = generateCryptoToken();
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

    await store.createRefreshToken(user.id, newRefreshHash, refreshExpiry);
    await store.revokeRefreshToken(record.id, newRawRefreshToken);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      fullName: user.fullName,
    });

    res.cookie('loopnex_refresh_token', newRawRefreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      path: '/',
    });

    sendSuccess(res, {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions: user.role.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = forgotPasswordSchema.parse(req.body);
    const user = await store.findUserByEmail(validated.email);

    // Security requirement: Never reveal whether an email address exists!
    if (user && user.isActive) {
      const { rawToken, tokenHash } = generateCryptoToken();
      const expiresAt = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

      await store.createPasswordResetToken(user.id, tokenHash, expiresAt);

      await store.createAuditLog({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'AUTH',
        entityId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });

      await emailService.sendPasswordResetEmail(user.email, rawToken, user.fullName);
    }

    sendSuccess(res, {
      message:
        'If an account is associated with this email address, password reset instructions have been dispatched.',
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = resetPasswordSchema.parse(req.body);

    const passwordCheck = validatePasswordStrength(validated.password);
    if (!passwordCheck.isValid) {
      sendError(res, passwordCheck.error!, 400, 'WEAK_PASSWORD');
      return;
    }

    const tokenHash = hashToken(validated.token);
    const resetRecord = await store.findPasswordResetToken(tokenHash);

    if (!resetRecord) {
      sendError(res, 'Password reset link is invalid or has expired.', 400, 'INVALID_RESET_TOKEN');
      return;
    }

    if (resetRecord.usedAt) {
      sendError(
        res,
        'This password reset link has already been used. Please request a new link.',
        400,
        'TOKEN_ALREADY_USED'
      );
      return;
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      sendError(
        res,
        'This password reset link has expired. Please request a new link.',
        400,
        'TOKEN_EXPIRED'
      );
      return;
    }

    const user = await store.findUserById(resetRecord.userId);
    if (!user || !user.isActive) {
      sendError(res, 'User account is inactive or not found.', 400, 'USER_INACTIVE');
      return;
    }

    const newPasswordHash = await hashPassword(validated.password);
    await store.updateUser(user.id, { passwordHash: newPasswordHash });
    await store.markPasswordResetTokenUsed(resetRecord.id);

    // Invalidate all existing refresh tokens for security
    await store.revokeAllUserRefreshTokens(user.id);

    await store.createAuditLog({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'AUTH',
      entityId: user.id,
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });

    sendSuccess(res, {
      message: 'Password has been successfully updated. You may now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    const user = await store.findUserById(req.user.id);
    if (!user) {
      sendError(res, 'User profile not found.', 404, 'USER_NOT_FOUND');
      return;
    }

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions: user.role.permissions,
        department: user.department,
        phone: user.phone,
        status: user.status,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
