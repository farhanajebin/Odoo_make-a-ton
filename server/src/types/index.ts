export interface HealthCheckResponse {
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
