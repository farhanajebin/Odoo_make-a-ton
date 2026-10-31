import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/security.js';
import { store } from '../services/store.service.js';
import { sendError } from '../utils/response.js';

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.loopnex_access_token) {
      token = req.cookies.loopnex_access_token;
    }

    if (!token) {
      sendError(res, 'Authentication required. No valid session token provided.', 401, 'UNAUTHORIZED');
      return;
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      sendError(res, 'Session token is invalid or has expired. Please log in again.', 401, 'INVALID_TOKEN');
      return;
    }

    const user = await store.findUserById(payload.userId);
    if (!user) {
      sendError(res, 'User account associated with this session no longer exists.', 401, 'USER_NOT_FOUND');
      return;
    }

    if (!user.isActive || user.status !== 'ACTIVE') {
      sendError(res, 'Your account has been deactivated. Please contact an administrator.', 403, 'ACCOUNT_DISABLED');
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      permissions: user.role.permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: string[]) {
  const normalizedRoles = allowedRoles.map((r) => r.toUpperCase());
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    if (!normalizedRoles.includes(req.user.role.toUpperCase())) {
      // Record unauthorized access attempt in audit log
      store.createAuditLog({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ACCESS',
        entityType: 'ROLE_GUARD',
        entityId: req.user.role,
        metadata: {
          path: req.originalUrl,
          method: req.method,
          requiredRoles: normalizedRoles,
          userRole: req.user.role,
        },
        ipAddress: req.ip || req.socket.remoteAddress || null,
      }).catch(() => {});

      sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
}

export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    if (req.user.permissions.includes('admin:all')) {
      return next();
    }

    const hasAll = requiredPermissions.every((perm) => req.user!.permissions.includes(perm));
    if (!hasAll) {
      sendError(
        res,
        'Access denied. Insufficient granular permissions for this action.',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
      return;
    }

    next();
  };
}

export function requireOwnership(paramKey = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    // Admins and Staff bypass strict ownership when managing records
    if (['ADMIN', 'STAFF'].includes(req.user.role.toUpperCase())) {
      return next();
    }

    // Customers can ONLY access their own resource matching req.user.id
    const targetResourceId = req.params[paramKey];
    if (targetResourceId && targetResourceId !== req.user.id) {
      store.createAuditLog({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ACCESS',
        entityType: 'RESOURCE_OWNERSHIP',
        entityId: targetResourceId,
        metadata: {
          targetResourceId,
          userResourceId: req.user.id,
          path: req.originalUrl,
        },
        ipAddress: req.ip || req.socket.remoteAddress || null,
      }).catch(() => {});

      sendError(
        res,
        'Access denied. You may only view or modify your own customer account records.',
        403,
        'FORBIDDEN_RESOURCE'
      );
      return;
    }

    next();
  };
}
