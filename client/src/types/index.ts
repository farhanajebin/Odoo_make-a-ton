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


// -----------------------------------------------------------------------------
// Staff Operations Domain Types (Commit 02 / Staff Dashboard Engine)
// -----------------------------------------------------------------------------
export interface CustomerItem {
  id: string;
  legalName: string;
  tradingName?: string | null;
  email: string;
  phone?: string | null;
  company: string;
  customerType: 'ENTERPRISE' | 'MID_MARKET' | 'STARTUP';
  activeSubscriptions: number;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  assignedStaff?: string | null;
  address?: string | null;
  createdAt: string;
  subscriptions?: Array<{ id: string; subNumber: string; plan: string; amount: number; status: string }>;
  invoices?: Array<{ id: string; invoiceNumber: string; total: number; balanceDue: number; status: string; dueDate: string }>;
}

export interface QuotationItem {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  product: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil: string;
  createdAt: string;
  notes?: string | null;
}

export interface SubscriptionItem {
  id: string;
  subNumber: string;
  customerId: string;
  customerName: string;
  product: string;
  variant: string;
  plan: string;
  cadence: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  status: 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'CLOSED';
  addOns: string[];
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionId?: string | null;
  subNumber?: string | null;
  issuedAt: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
  lines: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

export interface PaymentItem {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  method: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD';
  paymentDate: string;
  amount: number;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
  notes?: string | null;
}

export interface StaffOverviewData {
  assignedCustomers: number;
  activeSubscriptions: number;
  pendingQuotations: number;
  pendingInvoices: number;
  paymentsCollected: number;
  overdueInvoices: number;
  subscriptionTrends: Array<{ month: string; active: number; new: number; churn: number }>;
  recentActivities: Array<{ id: string; type: string; title: string; description: string; time: string; badge: string; badgeColor: string }>;
  pendingTasks: Array<{ id: string; type: string; title: string; subtitle: string; urgency: 'high' | 'medium' | 'low'; actionLabel: string; targetPath: string }>;
}

export interface StaffReportsData {
  assignedCustomerReport: {
    totalAccounts: number;
    activeRate: number;
    healthScore: number;
    distribution: Array<{ tier: string; count: number; value: number }>;
  };
  subscriptionReport: {
    totalActive: number;
    mrr: number;
    renewalRate: number;
    plans: Array<{ plan: string; count: number; mrr: number }>;
  };
  quotationReport: {
    totalCreated: number;
    totalValue: number;
    winRate: number;
    statusCounts: Record<string, number>;
  };
  invoiceReport: {
    totalInvoiced: number;
    totalCollected: number;
    overdueTotal: number;
    dsoDays: number;
    statusCounts: Record<string, number>;
  };
  paymentReport: {
    totalVolume: number;
    count: number;
    byMethod: Record<string, number>;
  };
}
