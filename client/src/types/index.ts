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
