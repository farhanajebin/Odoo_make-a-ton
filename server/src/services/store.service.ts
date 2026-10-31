import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from './prisma.js';

export interface RoleData {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'INVITED';
  roleId: string;
  role: RoleData;
  department?: string | null;
  phone?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByToken?: string | null;
  createdAt: Date;
}

export interface AuditLogData {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// In-Memory Fallback State (Active whenever PostgreSQL is not connected)
// -----------------------------------------------------------------------------
const MEMORY_ROLES: RoleData[] = [
  {
    id: 'role_admin_01',
    name: 'ADMIN',
    description: 'System Administrator with full system control and staff management',
    permissions: ['admin:all', 'staff:manage', 'audit:view', 'settings:manage'],
  },
  {
    id: 'role_staff_01',
    name: 'STAFF',
    description: 'Operational Revenue Operations Staff with operational and customer view access',
    permissions: ['staff:operational', 'customers:read', 'invoices:read', 'renewals:read'],
  },
  {
    id: 'role_customer_01',
    name: 'CUSTOMER',
    description: 'Subscribed Customer with access strictly limited to own account resources',
    permissions: ['customer:own_records', 'profile:update_own'],
  },
];

const MEMORY_USERS: UserData[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@loopnex.io',
    passwordHash: bcrypt.hashSync('Loopnex@Admin2026!', 10),
    fullName: 'Alex Drake',
    firstName: 'Alex',
    lastName: 'Drake',
    isActive: true,
    status: 'ACTIVE',
    roleId: 'role_admin_01',
    role: MEMORY_ROLES[0],
    department: 'EXECUTIVE',
    phone: '+1 (555) 019-2834',
    lastLoginAt: new Date(),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date(),
  },
  {
    id: 'usr_staff_01',
    email: 'staff@loopnex.io',
    passwordHash: bcrypt.hashSync('Loopnex@Staff2026!', 10),
    fullName: 'Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    isActive: true,
    status: 'ACTIVE',
    roleId: 'role_staff_01',
    role: MEMORY_ROLES[1],
    department: 'OPERATIONS',
    phone: '+1 (555) 014-9921',
    lastLoginAt: new Date(),
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
    updatedAt: new Date(),
  },
  {
    id: 'usr_customer_01',
    email: 'customer@loopnex.io',
    passwordHash: bcrypt.hashSync('Loopnex@Customer2026!', 10),
    fullName: 'Elena Rostova',
    firstName: 'Elena',
    lastName: 'Rostova',
    isActive: true,
    status: 'ACTIVE',
    roleId: 'role_customer_01',
    role: MEMORY_ROLES[2],
    phone: '+1 (555) 082-1133',
    lastLoginAt: new Date(),
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date(),
  },
];

const MEMORY_RESET_TOKENS: PasswordResetTokenData[] = [];
const MEMORY_REFRESH_TOKENS: RefreshTokenData[] = [];
const MEMORY_AUDIT_LOGS: AuditLogData[] = [];

class StoreService {
  private isPrismaHealthy: boolean | null = null;
  private lastHealthCheck = 0;

  private async checkPrisma(): Promise<boolean> {
    const prisma = getPrismaClient();
    if (!prisma) return false;

    const now = Date.now();
    if (this.isPrismaHealthy === false && now - this.lastHealthCheck < 15000) {
      return false;
    }

    try {
      this.lastHealthCheck = now;
      await prisma.$queryRaw`SELECT 1`;
      this.isPrismaHealthy = true;
      return true;
    } catch {
      this.isPrismaHealthy = false;
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Role Operations
  // ---------------------------------------------------------------------------
  async findRoleByName(name: string): Promise<RoleData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const role = await prisma.role.findUnique({ where: { name: name.toUpperCase() } });
      if (role) {
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: (role.permissions as string[]) || [],
        };
      }
    }
    const found = MEMORY_ROLES.find((r) => r.name.toUpperCase() === name.toUpperCase());
    return found ? { ...found } : null;
  }

  async findRoleById(id: string): Promise<RoleData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const role = await prisma.role.findUnique({ where: { id } });
      if (role) {
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: (role.permissions as string[]) || [],
        };
      }
    }
    const found = MEMORY_ROLES.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  // ---------------------------------------------------------------------------
  // User Operations
  // ---------------------------------------------------------------------------
  async findUserByEmail(email: string): Promise<UserData | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { role: true, staffProfile: true },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          status: user.status as UserData['status'],
          roleId: user.roleId,
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            permissions: (user.role.permissions as string[]) || [],
          },
          department: user.staffProfile?.department || null,
          phone: user.staffProfile?.phone || null,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }
    const found = MEMORY_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
    return found ? { ...found } : null;
  }

  async findUserById(id: string): Promise<UserData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { role: true, staffProfile: true },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          status: user.status as UserData['status'],
          roleId: user.roleId,
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            permissions: (user.role.permissions as string[]) || [],
          },
          department: user.staffProfile?.department || null,
          phone: user.staffProfile?.phone || null,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }
    const found = MEMORY_USERS.find((u) => u.id === id);
    return found ? { ...found } : null;
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: string;
    department?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<UserData> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const role = (await this.findRoleById(data.roleId)) || MEMORY_ROLES[2];
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const created = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          firstName,
          lastName,
          roleId: role.id,
          isActive: data.isActive ?? true,
          status: (data.isActive ?? true) ? 'ACTIVE' : 'INACTIVE',
          ...(role.name === 'STAFF'
            ? {
                staffProfile: {
                  create: {
                    title: 'Revenue Operations Specialist',
                    department: (data.department as any) || 'OPERATIONS',
                    phone: data.phone,
                  },
                },
              }
            : {}),
        },
        include: { role: true, staffProfile: true },
      });

      return {
        id: created.id,
        email: created.email,
        passwordHash: created.passwordHash,
        fullName: created.fullName || data.fullName,
        firstName: created.firstName,
        lastName: created.lastName,
        isActive: created.isActive,
        status: created.status as UserData['status'],
        roleId: created.roleId,
        role: {
          id: created.role.id,
          name: created.role.name,
          description: created.role.description,
          permissions: (created.role.permissions as string[]) || [],
        },
        department: created.staffProfile?.department || data.department || null,
        phone: created.staffProfile?.phone || data.phone || null,
        lastLoginAt: created.lastLoginAt,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    }

    const newUser: UserData = {
      id: `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      firstName,
      lastName,
      isActive: data.isActive ?? true,
      status: (data.isActive ?? true) ? 'ACTIVE' : 'INACTIVE',
      roleId: role.id,
      role,
      department: data.department || null,
      phone: data.phone || null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MEMORY_USERS.push(newUser);
    return { ...newUser };
  }

  async updateUser(
    id: string,
    data: Partial<{
      fullName: string;
      passwordHash: string;
      isActive: boolean;
      status: UserData['status'];
      department: string | null;
      phone: string | null;
      lastLoginAt: Date;
    }>
  ): Promise<UserData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
          ...(data.isActive !== undefined && {
            isActive: data.isActive,
            status: data.isActive ? 'ACTIVE' : 'INACTIVE',
          }),
          ...(data.status !== undefined && { status: data.status as any }),
          ...(data.lastLoginAt !== undefined && { lastLoginAt: data.lastLoginAt }),
        },
        include: { role: true, staffProfile: true },
      });

      return {
        id: updated.id,
        email: updated.email,
        passwordHash: updated.passwordHash,
        fullName: updated.fullName || `${updated.firstName} ${updated.lastName}`.trim(),
        firstName: updated.firstName,
        lastName: updated.lastName,
        isActive: updated.isActive,
        status: updated.status as UserData['status'],
        roleId: updated.roleId,
        role: {
          id: updated.role.id,
          name: updated.role.name,
          description: updated.role.description,
          permissions: (updated.role.permissions as string[]) || [],
        },
        department: updated.staffProfile?.department || null,
        phone: updated.staffProfile?.phone || null,
        lastLoginAt: updated.lastLoginAt,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }

    const index = MEMORY_USERS.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const current = MEMORY_USERS[index];
    const updated: UserData = {
      ...current,
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive,
        status: data.isActive ? 'ACTIVE' : 'INACTIVE',
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.lastLoginAt !== undefined && { lastLoginAt: data.lastLoginAt }),
      updatedAt: new Date(),
    };
    MEMORY_USERS[index] = updated;
    return { ...updated };
  }

  async countActiveAdmins(): Promise<number> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      return await prisma.user.count({
        where: {
          role: { name: 'ADMIN' },
          isActive: true,
        },
      });
    }
    return MEMORY_USERS.filter((u) => u.role.name === 'ADMIN' && u.isActive).length;
  }

  async listStaff(searchQuery?: string): Promise<UserData[]> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const users = await prisma.user.findMany({
        where: {
          role: { name: 'STAFF' },
          ...(searchQuery
            ? {
                OR: [
                  { fullName: { contains: searchQuery, mode: 'insensitive' } },
                  { email: { contains: searchQuery, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: { role: true, staffProfile: true },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => ({
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        fullName: u.fullName || `${u.firstName} ${u.lastName}`.trim(),
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        status: u.status as UserData['status'],
        roleId: u.roleId,
        role: {
          id: u.role.id,
          name: u.role.name,
          description: u.role.description,
          permissions: (u.role.permissions as string[]) || [],
        },
        department: u.staffProfile?.department || 'OPERATIONS',
        phone: u.staffProfile?.phone || null,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    }

    let staff = MEMORY_USERS.filter((u) => u.role.name === 'STAFF');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      staff = staff.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return staff.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((u) => ({ ...u }));
  }

  // ---------------------------------------------------------------------------
  // Password Reset Token Operations
  // ---------------------------------------------------------------------------
  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenData> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.passwordResetToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      return {
        id: record.id,
        userId: record.userId,
        tokenHash: record.tokenHash,
        expiresAt: record.expiresAt,
        usedAt: record.usedAt,
        createdAt: record.createdAt,
      };
    }

    const tokenRecord: PasswordResetTokenData = {
      id: `prt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    MEMORY_RESET_TOKENS.push(tokenRecord);
    return { ...tokenRecord };
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });
      if (record) {
        return {
          id: record.id,
          userId: record.userId,
          tokenHash: record.tokenHash,
          expiresAt: record.expiresAt,
          usedAt: record.usedAt,
          createdAt: record.createdAt,
        };
      }
      return null;
    }

    const found = MEMORY_RESET_TOKENS.find((t) => t.tokenHash === tokenHash);
    return found ? { ...found } : null;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      await prisma.passwordResetToken.update({
        where: { id },
        data: { usedAt: new Date() },
      });
      return;
    }

    const item = MEMORY_RESET_TOKENS.find((t) => t.id === id);
    if (item) {
      item.usedAt = new Date();
    }
  }

  // ---------------------------------------------------------------------------
  // Refresh Token Operations
  // ---------------------------------------------------------------------------
  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenData> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      return {
        id: record.id,
        userId: record.userId,
        tokenHash: record.tokenHash,
        expiresAt: record.expiresAt,
        revokedAt: record.revokedAt,
        replacedByToken: record.replacedByToken,
        createdAt: record.createdAt,
      };
    }

    const tokenRecord: RefreshTokenData = {
      id: `rft_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      userId,
      tokenHash,
      expiresAt,
      revokedAt: null,
      replacedByToken: null,
      createdAt: new Date(),
    };
    MEMORY_REFRESH_TOKENS.push(tokenRecord);
    return { ...tokenRecord };
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      if (record) {
        return {
          id: record.id,
          userId: record.userId,
          tokenHash: record.tokenHash,
          expiresAt: record.expiresAt,
          revokedAt: record.revokedAt,
          replacedByToken: record.replacedByToken,
          createdAt: record.createdAt,
        };
      }
      return null;
    }

    const found = MEMORY_REFRESH_TOKENS.find((t) => t.tokenHash === tokenHash);
    return found ? { ...found } : null;
  }

  async revokeRefreshToken(id: string, replacedByToken?: string): Promise<void> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      await prisma.refreshToken.update({
        where: { id },
        data: {
          revokedAt: new Date(),
          ...(replacedByToken && { replacedByToken }),
        },
      });
      return;
    }

    const item = MEMORY_REFRESH_TOKENS.find((t) => t.id === id);
    if (item) {
      item.revokedAt = new Date();
      if (replacedByToken) {
        item.replacedByToken = replacedByToken;
      }
    }
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }

    MEMORY_REFRESH_TOKENS.forEach((t) => {
      if (t.userId === userId && !t.revokedAt) {
        t.revokedAt = new Date();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Audit Log Operations
  // ---------------------------------------------------------------------------
  async createAuditLog(data: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
  }): Promise<AuditLogData> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const created = await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          entityType: data.entityType,
          entity: data.entityType,
          entityId: data.entityId || null,
          metadata: (data.metadata as any) || undefined,
          details: (data.metadata as any) || undefined,
          ipAddress: data.ipAddress || null,
        },
      });
      return {
        id: created.id,
        userId: created.userId,
        action: created.action,
        entityType: created.entityType,
        entityId: created.entityId,
        metadata: created.metadata as Record<string, unknown> | null,
        ipAddress: created.ipAddress,
        createdAt: created.createdAt,
      };
    }

    const log: AuditLogData = {
      id: `aud_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      userId: data.userId || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      createdAt: new Date(),
    };
    MEMORY_AUDIT_LOGS.unshift(log);
    // Keep last 1000 logs in memory
    if (MEMORY_AUDIT_LOGS.length > 1000) {
      MEMORY_AUDIT_LOGS.pop();
    }
    return { ...log };
  }

  async listAuditLogs(limit = 100): Promise<AuditLogData[]> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata as Record<string, unknown> | null,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      }));
    }

    return MEMORY_AUDIT_LOGS.slice(0, limit).map((l) => ({ ...l }));
  }
}

export const store = new StoreService();
