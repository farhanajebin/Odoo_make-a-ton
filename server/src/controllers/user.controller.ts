import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../services/store.service.js';
import { validatePasswordStrength, hashPassword, verifyPassword } from '../utils/security.js';
import { sendSuccess, sendError } from '../utils/response.js';

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await store.findUserById(req.user!.id);
    if (!user) {
      sendError(res, 'User profile not found.', 404, 'USER_NOT_FOUND');
      return;
    }

    sendSuccess(res, {
      profile: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        permissions: user.role.permissions,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = updateUserSchema.parse(req.body);
    const user = await store.findUserById(req.user!.id);

    if (!user) {
      sendError(res, 'User not found.', 404, 'USER_NOT_FOUND');
      return;
    }

    let updatedPasswordHash: string | undefined;

    // Handle password change if requested
    if (validated.newPassword) {
      if (!validated.currentPassword) {
        sendError(res, 'Current password is required to set a new password.', 400, 'CURRENT_PASSWORD_REQUIRED');
        return;
      }

      const isCurrentValid = await verifyPassword(validated.currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        sendError(res, 'Current password provided is incorrect.', 400, 'INVALID_CURRENT_PASSWORD');
        return;
      }

      const passwordCheck = validatePasswordStrength(validated.newPassword);
      if (!passwordCheck.isValid) {
        sendError(res, passwordCheck.error!, 400, 'WEAK_PASSWORD');
        return;
      }

      updatedPasswordHash = await hashPassword(validated.newPassword);
    }

    const updated = await store.updateUser(user.id, {
      ...(validated.fullName && { fullName: validated.fullName }),
      ...(validated.phone !== undefined && { phone: validated.phone }),
      ...(validated.department !== undefined && { department: validated.department }),
      ...(updatedPasswordHash && { passwordHash: updatedPasswordHash }),
    });

    if (!updated) {
      sendError(res, 'Failed to update profile.', 500, 'UPDATE_FAILED');
      return;
    }

    await store.createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'USER_PROFILE',
      entityId: user.id,
      metadata: { fieldsUpdated: Object.keys(validated) },
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });

    sendSuccess(res, {
      message: 'Profile updated successfully',
      profile: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role.name,
        permissions: updated.role.permissions,
        department: updated.department,
        phone: updated.phone,
        status: updated.status,
      },
    });
  } catch (error) {
    next(error);
  }
}
