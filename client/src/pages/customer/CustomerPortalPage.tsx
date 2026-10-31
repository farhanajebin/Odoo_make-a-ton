import React from 'react';
import {
  CreditCard,
  FileText,
  Repeat,
  CheckCircle,
  User as UserIcon,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const CustomerPortalPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-gradient-to-r from-loopnex-surface/90 via-loopnex-graphite to-loopnex-deepNavy p-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="sm">Customer Portal</Badge>
            <span className="text-xs text-slate-400">Account Verified</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5">
            Hello, {user?.fullName || 'Customer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Manage your personal profile, review active recurring billing arrangements, and access payment receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-loopnex-surface border border-loopnex-surfaceBorder text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Role</span>
            CUSTOMER
          </div>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-loopnex-electricTeal" />
            Billing Profile
          </h2>
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Full Name</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {user?.fullName}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Email Address</span>
              <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {user?.email}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Customer ID</span>
              <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                {user?.id}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Security Status</span>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Active &amp; Identity Verified</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Membership Summary */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-loopnex-violetAccent" />
            Account Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 p-4">
              <span className="text-[11px] text-slate-400">Plan Status</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Standard Tier
              </p>
              <Badge variant="teal" size="sm" className="mt-2">Active</Badge>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 p-4">
              <span className="text-[11px] text-slate-400">Next Renewal</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                On Schedule
              </p>
              <span className="text-[10px] text-slate-500 mt-2 block">Monthly cadence</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 p-4">
              <span className="text-[11px] text-slate-400">Ledger Balance</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                $0.00
              </p>
              <span className="text-[10px] text-emerald-400 mt-2 block">All accounts settled</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Clean Empty States for Future Commit Modules (Subscriptions, Invoices, Payments) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscriptions Card */}
        <Card className="p-6 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-loopnex-surface border border-loopnex-surfaceBorder flex items-center justify-center text-loopnex-electricTeal mb-3">
            <Repeat className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Subscriptions</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            No active subscription contracts are currently linked to this customer account.
          </p>
          <div className="mt-4">
            <Badge variant="slate" size="sm">Coming in Commit 06</Badge>
          </div>
        </Card>

        {/* Invoices Card */}
        <Card className="p-6 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-loopnex-surface border border-loopnex-surfaceBorder flex items-center justify-center text-loopnex-softCyan mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Billing Invoices</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            You have no outstanding or past invoices. All issued invoices will appear here.
          </p>
          <div className="mt-4">
            <Badge variant="slate" size="sm">Coming in Commit 07</Badge>
          </div>
        </Card>

        {/* Payment Methods Card */}
        <Card className="p-6 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-loopnex-surface border border-loopnex-surfaceBorder flex items-center justify-center text-loopnex-violetAccent mb-3">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Payment Methods</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Credit card and ACH payment gateways will be configurable here for automatic reconciliation.
          </p>
          <div className="mt-4">
            <Badge variant="slate" size="sm">Coming in Commit 08</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
