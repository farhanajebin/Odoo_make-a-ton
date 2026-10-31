import React from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const operationalStats = [
    {
      title: 'Assigned Accounts',
      value: '24',
      subtext: 'Active enterprise clients',
      icon: Users,
      color: 'teal',
    },
    {
      title: 'Pending Triage',
      value: '5',
      subtext: 'Requires operational review',
      icon: Clock,
      color: 'amber',
    },
    {
      title: 'Healthy Portfolio',
      value: '96.2%',
      subtext: 'Retention telemetry',
      icon: TrendingUp,
      color: 'cyan',
    },
    {
      title: 'Compliance Status',
      value: 'Verified',
      subtext: 'Staff clearance active',
      icon: Shield,
      color: 'violet',
    },
  ];

  const assignedAccounts = [
    {
      id: '1',
      name: 'Acme Global Technologies',
      contact: 'sarah.c@acme.io',
      tier: 'Enterprise Custom',
      status: 'In Review',
      priority: 'High',
    },
    {
      id: '2',
      name: 'Synthetix Dynamics Corp',
      contact: 'david.m@synthetix.com',
      tier: 'Scale Tier',
      status: 'Active',
      priority: 'Normal',
    },
    {
      id: '3',
      name: 'Vanguard Biometrics',
      contact: 'alicia.w@vanguard.org',
      tier: 'Growth Tier',
      status: 'Renewal Pending',
      priority: 'High',
    },
    {
      id: '4',
      name: 'Oasis Cloud Infrastructure',
      contact: 'mark.k@oasis.net',
      tier: 'Enterprise Custom',
      status: 'Active',
      priority: 'Low',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-gradient-to-r from-loopnex-surface/80 via-loopnex-graphite to-loopnex-deepNavy p-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">Staff Portal</Badge>
            <span className="text-xs text-slate-400">Department: {user?.department || 'Operations'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5">
            Welcome back, {user?.fullName || 'Staff Member'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            You are operating under staff permissions. Access is granted to assigned client accounts and operational workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-loopnex-surface border border-loopnex-surfaceBorder text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Access Scope</span>
            Operational Staff
          </div>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationalStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-loopnex-secondaryText font-medium">
                  {stat.title}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{stat.subtext}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-loopnex-surface border border-loopnex-surfaceBorder text-loopnex-softCyan">
                <Icon className="h-5 w-5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Operational Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-loopnex-surfaceBorder flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Assigned Client Accounts
            </h2>
            <p className="text-xs text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
              Portfolio allocated to your staff account for operational oversight
            </p>
          </div>
          <Badge variant="slate" size="sm">4 Allocated</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-loopnex-surface/40 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-loopnex-surfaceBorder">
              <tr>
                <th className="px-5 py-3">Account Name</th>
                <th className="px-5 py-3">Primary Contact</th>
                <th className="px-5 py-3">Plan Tier</th>
                <th className="px-5 py-3">Triage Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-loopnex-surfaceBorder/60">
              {assignedAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50/50 dark:hover:bg-loopnex-surface/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    {account.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-loopnex-secondaryText font-mono text-[11px]">
                    {account.contact}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {account.tier}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="h-2.5 w-2.5" />
                      {account.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {account.priority === 'High' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> High
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="inline-flex items-center gap-1 text-[11px] font-medium text-loopnex-electricTeal hover:underline">
                      View Account
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
