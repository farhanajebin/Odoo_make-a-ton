import axios, { AxiosError } from 'axios';
import {
  HealthStatus,
  User,
  StaffMember,
  AuditLogItem,
  ApiResponse,
  AuthResponseData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// In-Memory Token Store (Security: Never store tokens in localStorage)
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Automatically sends and receives HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless Refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Do not attempt token refresh for login, register, or refresh itself
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/refresh');
        const newToken = data.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// Health Service
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------
export const authApi = {
  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    const data = response.data.data!;
    setAccessToken(data.accessToken);
    return data;
  },

  async login(payload: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    const data = response.data.data!;
    setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async refresh(): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/refresh');
    const data = response.data.data!;
    setAccessToken(data.accessToken);
    return data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data!.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
      email,
    });
    return response.data.data?.message || 'Password reset link sent.';
  },

  async resetPassword(payload: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload);
    return response.data.data?.message || 'Password successfully updated.';
  },
};

// -----------------------------------------------------------------------------
// Admin Endpoints
// -----------------------------------------------------------------------------
export const adminApi = {
  async getStaff(search?: string): Promise<StaffMember[]> {
    const response = await apiClient.get<ApiResponse<{ staff: StaffMember[] }>>('/admin/staff', {
      params: search ? { search } : undefined,
    });
    return response.data.data?.staff || [];
  },

  async createStaff(payload: {
    fullName: string;
    email: string;
    department?: string;
    phone?: string;
    password?: string;
  }): Promise<StaffMember> {
    const response = await apiClient.post<ApiResponse<{ staff: StaffMember }>>('/admin/staff', payload);
    return response.data.data!.staff;
  },

  async updateStaffStatus(id: string, isActive: boolean): Promise<void> {
    await apiClient.patch(`/admin/staff/${id}/status`, { isActive });
  },

  async getAuditLogs(limit = 100): Promise<AuditLogItem[]> {
    const response = await apiClient.get<ApiResponse<{ logs: AuditLogItem[] }>>('/admin/audit-logs', {
      params: { limit },
    });
    return response.data.data?.logs || [];
  },
};

// -----------------------------------------------------------------------------
// User Profile Endpoints
// -----------------------------------------------------------------------------
export const userApi = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ profile: User }>>('/users/me');
    return response.data.data!.profile;
  },

  async updateProfile(payload: {
    fullName?: string;
    phone?: string;
    department?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    const response = await apiClient.patch<ApiResponse<{ profile: User }>>('/users/me', payload);
    return response.data.data!.profile;
  },
};
