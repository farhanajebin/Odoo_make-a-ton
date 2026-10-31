import React from 'react';
import { Users, Repeat, DollarSign, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { KpiMetric } from '../../types';
import { cn } from '../../lib/utils';

interface KpiCardsProps {
  isDemoMode: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ isDemoMode }) => {
  // Live empty state (Real state when PostgreSQL has 0 records)
  const emptyMetrics: KpiMetric[] = [
    {
      id: 'customers',
      label: 'Total Customers',
      value: '0',
      rawNumber: 0,
      changePercentage: 0,
      trend: 'neutral',
      subtext: 'No accounts registered yet',
      icon: 'Users',
    },
    {
      id: 'subscriptions',
      label: 'Active Subscriptions',
      value: '0',
      rawNumber: 0,
      changePercentage: 0,
      trend: 'neutral',
      subtext: '0 active recurring contracts',
      icon: 'Repeat',
    },
    {
      id: 'mrr',
      label: 'Monthly Recurring Revenue',
      value: '$0.00',
      rawNumber: 0,
      changePercentage: 0,
      trend: 'neutral',
      subtext: 'MRR tracking will start on first plan',
      icon: 'DollarSign',
    },
    {
      id: 'invoices',
      label: 'Outstanding Invoices',
      value: '$0.00',
      rawNumber: 0,
      changePercentage: 0,
      trend: 'neutral',
      subtext: '0 open receivables awaiting payment',
      icon: 'AlertCircle',
    },
  ];

  // Demonstration Data (Explicitly tagged as sample simulation)
  const demoMetrics: KpiMetric[] = [
    {
      id: 'customers',
      label: 'Total Customers',
      value: '1,428',
      rawNumber: 1428,
      changePercentage: 12.4,
      trend: 'up',
      subtext: '+142 new accounts this month',
      icon: 'Users',
    },
    {
      id: 'subscriptions',
      label: 'Active Subscriptions',
      value: '1,894',
      rawNumber: 1894,
      changePercentage: 8.7,
      trend: 'up',
      subtext: '98.2% healthy renewal rate',
      icon: 'Repeat',
    },
    {
      id: 'mrr',
      label: 'Monthly Recurring Revenue',
      value: '$184,520',
      rawNumber: 184520,
      changePercentage: 14.2,
      trend: 'up',
      subtext: '+$22.8k net new MRR',
      icon: 'DollarSign',
    },
    {
      id: 'invoices',
      label: 'Outstanding Invoices',
      value: '$14,280',
      rawNumber: 14280,
      changePercentage: -5.1,
      trend: 'down',
      subtext: '6 invoices due in 7 days',
      icon: 'AlertCircle',
    },
  ];

  const metrics = isDemoMode ? demoMetrics : emptyMetrics;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="h-5 w-5 text-loopnex-electricTeal" />;
      case 'Repeat':
        return <Repeat className="h-5 w-5 text-loopnex-softCyan" />;
      case 'DollarSign':
        return <DollarSign className="h-5 w-5 text-emerald-400" />;
      case 'AlertCircle':
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
      default:
        return <Users className="h-5 w-5 text-loopnex-electricTeal" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((kpi) => (
        <Card key={kpi.id} hoverEffect className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-loopnex-secondaryText">
                {kpi.label}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-loopnex-surface border border-slate-200 dark:border-loopnex-surfaceBorder/60">
                {renderIcon(kpi.icon)}
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-loopnex-primaryText">
                {kpi.value}
              </span>

              {isDemoMode ? (
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up' && (
                    <Badge variant="teal" size="sm" className="font-semibold">
                      <TrendingUp className="h-3 w-3" />
                      +{kpi.changePercentage}%
                    </Badge>
                  )}
                  {kpi.trend === 'down' && (
                    <Badge variant="emerald" size="sm" className="font-semibold">
                      <TrendingDown className="h-3 w-3" />
                      {kpi.changePercentage}%
                    </Badge>
                  )}
                  {kpi.trend === 'neutral' && (
                    <Badge variant="slate" size="sm">
                      <Minus className="h-3 w-3" />
                      0%
                    </Badge>
                  )}
                </div>
              ) : (
                <Badge variant="slate" size="sm">
                  Zero Baseline
                </Badge>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-loopnex-secondaryText">
              <span className="truncate">{kpi.subtext}</span>
              {isDemoMode && (
                <span className="text-[9px] uppercase tracking-wider text-amber-500 font-medium">
                  DEMO
                </span>
              )}
            </div>
          </CardContent>

          {/* Bottom subtle accent line */}
          <div
            className={cn(
              'h-0.5 w-full bg-slate-100 dark:bg-loopnex-surfaceBorder',
              isDemoMode && 'bg-gradient-to-r from-transparent via-loopnex-electricTeal/40 to-transparent'
            )}
          />
        </Card>
      ))}
    </div>
  );
};
