import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StaffLayout } from '../components/layout/StaffLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { UpcomingPage } from '../pages/UpcomingPage';
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
import { CustomerPortalPage } from '../pages/customer/CustomerPortalPage';
import { StaffManagementPage } from '../pages/admin/StaffManagementPage';
import { AuditSecurityPage } from '../pages/admin/AuditSecurityPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleRoute } from '../components/auth/RoleRoute';
import { AdminApp } from '../admin/AdminApp';
import { CustomerApp } from '../customer/CustomerApp';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Endpoints */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* NEW INDEPENDENT ADMIN PANEL — Isolated at /admin/* */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* NEW INDEPENDENT CUSTOMER PORTAL — Isolated at /customer/* */}
      <Route path="/customer/*" element={<CustomerApp />} />

      {/* Protected Enterprise SaaS Hierarchy */}
      <Route element={<ProtectedRoute />}>
        {/* ================================================================= */}
        {/* STAFF OPERATIONAL DASHBOARD (Floating Black Sidebar & White Canvas) */}
        {/* ================================================================= */}
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

        {/* ================================================================= */}
        {/* CORE PLATFORM & ADMIN INTERFACE (Standard DashboardLayout) */}
        {/* ================================================================= */}
        <Route element={<DashboardLayout />}>
          {/* ADMIN ONLY ROUTES */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/admin/staff" element={<StaffManagementPage />} />
            <Route path="/audit" element={<AuditSecurityPage />} />
            <Route path="/command-center" element={<UpcomingPage />} />
            <Route path="/products" element={<UpcomingPage />} />
            <Route path="/plans" element={<UpcomingPage />} />
            <Route path="/payments" element={<UpcomingPage />} />
            <Route path="/discounts" element={<UpcomingPage />} />
            <Route path="/radar" element={<UpcomingPage />} />
            <Route path="/intelligence" element={<UpcomingPage />} />
            <Route path="/reports" element={<UpcomingPage />} />
            <Route path="/settings" element={<UpcomingPage />} />
            <Route path="/customers" element={<UpcomingPage />} />
            <Route path="/quotations" element={<UpcomingPage />} />
            <Route path="/subscriptions" element={<UpcomingPage />} />
            <Route path="/invoices" element={<UpcomingPage />} />
            <Route path="/renewals" element={<UpcomingPage />} />
          </Route>

          {/* CUSTOMER PORTAL ROUTES */}
          <Route element={<RoleRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
            <Route path="/portal/dashboard" element={<CustomerPortalPage />} />
          </Route>

          {/* Fallback Unmatched Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
