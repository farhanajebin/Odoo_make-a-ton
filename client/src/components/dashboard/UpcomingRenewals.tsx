import React from 'react';
import { RefreshCw, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RenewalItem } from '../../types';

interface UpcomingRenewalsProps {
  isDemoMode: boolean;
}

export const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({ isDemoMode }) => {
  const demoRenewals: RenewalItem[] = [
    {
      id: 'ren-1',
      customerName: 'Datastream Technologies',
      planName: 'Enterprise Growth Tier',
      renewalDate: 'Nov 12, 2026',
      daysRemaining: 12,
      value: '$24,000 / yr',
      healthScore: 94,
      status: 'low_risk',
    },
    {
      id: 'ren-2',
      customerName: 'Nexis Logistics Global',
      planName: 'Fleet Operations Pro',
      renewalDate: 'Nov 18, 2026',
      daysRemaining: 18,
      value: '$18,500 / yr',
      healthScore: 82,
      status: 'low_risk',
    },
    {
      id: 'ren-3',
      customerName: 'Vertex Bioanalytics',
      planName: 'Clinical Lab Platform',
      renewalDate: 'Nov 24, 2026',
      daysRemaining: 24,
      value: '$32,000 / yr',
      healthScore: 61,
      status: 'medium_risk',
    },
    {
      id: 'ren-4',
      customerName: 'Apex Media Holdings',
      planName: 'Broadcasting Cloud Core',
      renewalDate: 'Nov 29, 2026',
      daysRemaining: 29,
      value: '$48,000 / yr',
      healthScore: 42,
      status: 'high_risk',
    },
  ];

  const renewals = isDemoMode ? demoRenewals : [];

  const getStatusBadge = (status: RenewalItem['status'], health: number) => {
    switch (status) {
      case 'low_risk':
        return (
          <Badge variant="teal" size="sm" className="gap-1 font-semibold">
            <CheckCircle className="h-3 w-3" />
            Score: {health}% (Safe)
          </Badge>
        );
      case 'medium_risk':
        return (
          <Badge variant="amber" size="sm" className="gap-1 font-semibold">
            <Clock className="h-3 w-3" />
            Score: {health}% (Review)
          </Badge>
        );
      case 'high_risk':
        return (
          <Badge variant="rose" size="sm" className="gap-1 font-semibold">
            <ShieldAlert className="h-3 w-3" />
            Score: {health}% (At Risk)
          </Badge>
        );
    }
  };

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Upcoming Renewals Runway</CardTitle>
            <Badge variant="violet" size="sm">
              Smart Renewal Preview
            </Badge>
          </div>
          <CardDescription>
            30-day renewal horizon with proactive churn risk assessment
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {renewals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-loopnex-surface text-slate-400 mb-2">
              <RefreshCw className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
              No Approaching Subscription Renewals
            </p>
            <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText max-w-sm mt-1">
              Active recurring contracts will automatically enter this queue 60, 30, and 14 days before their expiration.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-loopnex-surfaceBorder text-slate-500 dark:text-loopnex-secondaryText font-medium">
                  <th className="pb-3 pl-2">Customer Account</th>
                  <th className="pb-3">Subscription Tier</th>
                  <th className="pb-3">Renewal Date</th>
                  <th className="pb-3">Contract Value</th>
                  <th className="pb-3 pr-2 text-right">Health Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-loopnex-surfaceBorder/40">
                {renewals.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-loopnex-surface/40 transition-colors"
                  >
                    <td className="py-3 pl-2 font-medium text-slate-900 dark:text-loopnex-primaryText">
                      {r.customerName}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-loopnex-secondaryText">
                      {r.planName}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-loopnex-secondaryText">
                      <span className="font-medium text-slate-900 dark:text-loopnex-primaryText">
                        {r.renewalDate}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">({r.daysRemaining}d left)</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-loopnex-primaryText">
                      {r.value}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {getStatusBadge(r.status, r.healthScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
