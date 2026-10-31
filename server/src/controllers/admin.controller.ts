import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../services/store.service.js';
import { validatePasswordStrength, hashPassword } from '../utils/security.js';
import { sendSuccess, sendError } from '../utils/response.js';

const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Staff full name must contain at least 2 characters'),
  email: z.string().email('Please enter a valid staff email address'),
  department: z.string().optional().default('OPERATIONS'),
  phone: z.string().optional(),
  password: z.string().optional(),
});

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export async function createStaffMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createStaffSchema.parse(req.body);

    // Check if email already in use
    const existing = await store.findUserByEmail(validated.email);
    if (existing) {
      sendError(res, 'An account with this email address already exists.', 409, 'EMAIL_ALREADY_EXISTS');
      return;
    }

    const defaultPassword = validated.password || 'StaffTemp@2026!';
    const passwordCheck = validatePasswordStrength(defaultPassword);
    if (!passwordCheck.isValid) {
      sendError(res, `Provided temporary password is weak: ${passwordCheck.error}`, 400, 'WEAK_PASSWORD');
      return;
    }

    const staffRole = await store.findRoleByName('STAFF');
    if (!staffRole) {
      sendError(res, 'Staff role is not configured.', 500, 'ROLE_NOT_FOUND');
      return;
    }

    const passwordHash = await hashPassword(defaultPassword);

    const newStaff = await store.createUser({
      email: validated.email,
      fullName: validated.fullName,
      passwordHash,
      roleId: staffRole.id,
      department: validated.department,
      phone: validated.phone,
      isActive: true,
    });

    await store.createAuditLog({
      userId: req.user!.id,
      action: 'STAFF_CREATED',
      entityType: 'STAFF',
      entityId: newStaff.id,
      metadata: {
        staffEmail: newStaff.email,
        staffName: newStaff.fullName,
        department: validated.department,
        createdBy: req.user!.id,
      },
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });

    sendSuccess(
      res,
      {
        message: 'Staff member account created successfully',
        staff: {
          id: newStaff.id,
          email: newStaff.email,
          fullName: newStaff.fullName,
          role: newStaff.role.name,
          department: newStaff.department,
          phone: newStaff.phone,
          isActive: newStaff.isActive,
          status: newStaff.status,
          createdAt: newStaff.createdAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getStaffList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search as string | undefined;
    const staffMembers = await store.listStaff(search);

    sendSuccess(res, {
      count: staffMembers.length,
      staff: staffMembers.map((s) => ({
        id: s.id,
        email: s.email,
        fullName: s.fullName,
        role: s.role.name,
        department: s.department,
        phone: s.phone,
        isActive: s.isActive,
        status: s.status,
        lastLoginAt: s.lastLoginAt,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStaffStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const validated = updateStatusSchema.parse(req.body);

    const user = await store.findUserById(id);
    if (!user) {
      sendError(res, 'User account not found.', 404, 'USER_NOT_FOUND');
      return;
    }

    // Critical Requirement: Prevent accidental removal/deactivation of the last active administrator!
    if (user.role.name === 'ADMIN' && !validated.isActive) {
      const activeAdminCount = await store.countActiveAdmins();
      if (activeAdminCount <= 1) {
        sendError(
          res,
          'Cannot deactivate the last active system administrator account.',
          400,
          'CANNOT_DEACTIVATE_LAST_ADMIN'
        );
        return;
      }
    }

    const updated = await store.updateUser(id, {
      isActive: validated.isActive,
      status: validated.isActive ? 'ACTIVE' : 'INACTIVE',
    });

    if (!updated) {
      sendError(res, 'Could not update user account.', 500, 'UPDATE_FAILED');
      return;
    }

    // If account was deactivated, revoke all refresh tokens immediately
    if (!validated.isActive) {
      await store.revokeAllUserRefreshTokens(id);
    }

    await store.createAuditLog({
      userId: req.user!.id,
      action: validated.isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
      entityType: 'USER',
      entityId: id,
      metadata: { targetEmail: user.email, targetRole: user.role.name },
      ipAddress: req.ip || req.socket.remoteAddress || null,
    });

    sendSuccess(res, {
      message: `Account has been ${validated.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        isActive: updated.isActive,
        status: updated.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await store.listAuditLogs(limit);

    sendSuccess(res, {
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
}
