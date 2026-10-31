import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StaffLayout } from '../components/layout/StaffLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';
import { StaffCustomersPage } from '../pages/staff/StaffCustomersPage';
import { StaffQuotationsPage } from '../pages/staff/StaffQuotationsPage';
import { StaffSubscriptionsPage } from '../pages/staff/StaffSubscriptionsPage';
import { StaffInvoicesPage } from '../pages/staff/StaffInvoicesPage';
import { StaffPaymentsPage } from '../pages/staff/StaffPaymentsPage';
import { StaffReportsPage } from '../pages/staff/StaffReportsPage';
import { StaffProfilePage } from '../pages/staff/StaffProfilePage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleRoute } from '../components/auth/RoleRoute';
import { AdminApp } from '../admin/AdminApp';
import { CustomerApp } from '../customer/CustomerApp';

/**
 * RootRedirect: Directs authenticated users to their corresponding dashboard
 * according to role, and unauthenticated visitors to /login.
 */
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090D1A] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide">Initializing LOOPNEX...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }

  if (user.role === 'CUSTOMER') {
    return <Navigate to="/customer" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Entry Point with Role-Aware Redirection */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Endpoints */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Legacy portal redirect to unified customer portal */}
      <Route path="/portal/*" element={<Navigate to="/customer" replace />} />

      {/* ADMIN DASHBOARD: Protected strictly for ADMIN role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/*" element={<AdminApp />} />
        </Route>
      </Route>

      {/* STAFF OPERATIONAL DASHBOARD: Protected for STAFF & ADMIN roles */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['STAFF', 'ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route path="/staff/dashboard" element={<Navigate to="/staff" replace />} />
            <Route path="/staff/customers" element={<StaffCustomersPage />} />
            <Route path="/staff/quotations" element={<StaffQuotationsPage />} />
            <Route path="/staff/subscriptions" element={<StaffSubscriptionsPage />} />
            <Route path="/staff/invoices" element={<StaffInvoicesPage />} />
            <Route path="/staff/payments" element={<StaffPaymentsPage />} />
            <Route path="/staff/reports" element={<StaffReportsPage />} />
            <Route path="/staff/profile" element={<StaffProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* CUSTOMER PORTAL: Protected for CUSTOMER & ADMIN roles */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
          <Route path="/customer/*" element={<CustomerApp />} />
        </Route>
      </Route>

      {/* Fallback Unmatched Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
