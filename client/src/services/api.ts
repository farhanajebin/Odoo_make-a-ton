import axios, { AxiosError } from 'axios';
import { HealthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return {
      status: 'error',
      application: 'LOOPNEX Platform',
      version: '0.1.0',
      environment: 'unknown',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 0,
      database: {
        status: 'disconnected',
        error: err.message || 'Cannot reach Express backend server',
      },
      features: {
        revenueRadar: 'planned',
        subscriptionHealthScore: 'planned',
        whatIfSimulator: 'planned',
        renewalCenter: 'planned',
        billingIntegrityGuardian: 'planned',
      },
    };
  }
}
