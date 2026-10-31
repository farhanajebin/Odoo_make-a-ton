import React, { useState } from 'react';
import { Sparkles, RefreshCw, Layers, ShieldCheck, Database, ArrowUpRight } from 'lucide-react';
import { KpiCards } from '../components/dashboard/KpiCards';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpcomingRenewals } from '../components/dashboard/UpcomingRenewals';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useHealth } from '../hooks/useHealth';

export const OverviewPage: React.FC = () => {
  // Demo mode toggle: Allows reviewers to see realistic SaaS visualization AND the zero-baseline empty state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const { isBackendOnline, health, refetch } = useHealth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-loopnex-primaryText">
              Business Overview
            </h1>
            <Badge variant="teal" size="sm">
              Commit 01 Foundation
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-loopnex-secondaryText mt-1">
            Your subscription business, connected.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-white dark:bg-loopnex-graphite shadow-xs">
            <span className="text-xs text-slate-600 dark:text-loopnex-secondaryText font-medium">
              Demo Simulation:
            </span>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDemoMode ? 'bg-loopnex-electricTeal' : 'bg-slate-300 dark:bg-loopnex-surface'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => refetch()}
          >
            Sync State
          </Button>
        </div>
      </div>

      {/* Demo Mode Notification Banner if Demo Mode is Active */}
      {isDemoMode ? (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              <strong className="font-semibold">Demonstration Mode Active:</strong> Displaying modeled recurring revenue metrics to demonstrate high-density operational telemetry. Toggle switch above to view live zero-record baseline.
            </span>
          </div>
          <button
            onClick={() => setIsDemoMode(false)}
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0 ml-2"
          >
            Switch to Empty State
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface/40 px-4 py-3 text-xs text-slate-600 dark:text-loopnex-secondaryText">
          <div className="flex items-center gap-2.5">
            <Database className="h-4 w-4 text-loopnex-electricTeal shrink-0" />
            <span>
              <strong className="font-semibold text-slate-900 dark:text-loopnex-primaryText">Pristine Zero State:</strong> Showing real empty state directly reflective of unseeded database tables.
            </span>
          </div>
          <button
            onClick={() => setIsDemoMode(true)}
            className="text-[11px] font-semibold text-loopnex-electricTeal hover:underline shrink-0 ml-2"
          >
            Simulate Enterprise Data
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <KpiCards isDemoMode={isDemoMode} />

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-12 gap-6">
        <RevenueChart isDemoMode={isDemoMode} />
        <RecentActivity isDemoMode={isDemoMode} />
      </div>

      {/* Renewals & Quick Actions Grid */}
      <div className="grid grid-cols-12 gap-6">
        <UpcomingRenewals isDemoMode={isDemoMode} />
        <QuickActions />
      </div>

      {/* Commit 01 Foundation Architecture Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-gradient-to-r from-slate-900 to-loopnex-graphite p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-loopnex-electricTeal" />
              <h3 className="text-base font-bold tracking-tight">
                LOOPNEX Foundation Core | Architecture Ready
              </h3>
              <Badge variant="teal" size="sm">
                Commit 01 / 11
              </Badge>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Express backend server, Zod environment validation, PostgreSQL Prisma client with 21 planned financial entities, and dark/light React design system configured. Backend status: {isBackendOnline ? 'ONLINE' : 'OFFLINE'} ({health?.application || 'LOOPNEX API'}).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">Full Stack Monorepo</p>
              <p className="text-[11px] text-slate-400">Node v24 + React 18 + Prisma 6</p>
            </div>
            <a
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-lg bg-loopnex-electricTeal px-3.5 py-2 text-xs font-semibold text-loopnex-deepNavy hover:bg-[#20BEAE] transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              View Architecture
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
