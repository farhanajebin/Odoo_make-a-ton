export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  application: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: 'connected' | 'disconnected' | 'unconfigured';
    latencyMs?: number;
    error?: string;
  };
  features: {
    revenueRadar: 'planned' | 'active';
    subscriptionHealthScore: 'planned' | 'active';
    whatIfSimulator: 'planned' | 'active';
    renewalCenter: 'planned' | 'active';
    billingIntegrityGuardian: 'planned' | 'active';
  };
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  rawNumber: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
  icon: string;
}

export interface RevenueDataPoint {
  month: string;
  mrr: number;
  expansion: number;
  churn: number;
  netRevenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'customer' | 'subscription' | 'invoice' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  amount?: string;
  status?: string;
}

export interface RenewalItem {
  id: string;
  customerName: string;
  planName: string;
  renewalDate: string;
  daysRemaining: number;
  value: string;
  healthScore: number; // 0-100 preview for future capability
  status: 'low_risk' | 'medium_risk' | 'high_risk';
}

// -----------------------------------------------------------------------------
// Identity & Access Engine Types (Commit 02)
// -----------------------------------------------------------------------------
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  department?: string | null;
  phone?: string | null;
  isActive?: boolean;
  status?: string;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department?: string | null;
  phone?: string | null;
  isActive: boolean;
  status: string;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface AuthResponseData {
  message?: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

