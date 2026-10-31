import React from 'react';
import { UserPlus, Repeat, FileCheck, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ActivityItem } from '../../types';

interface RecentActivityProps {
  isDemoMode: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ isDemoMode }) => {
  const demoActivities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'payment',
      title: 'Payment Received',
      description: 'Acme Global Corp completed payment for INV-2026-089',
      timestamp: '12m ago',
      amount: '$14,500.00',
      status: 'Succeeded',
    },
    {
      id: 'act-2',
      type: 'subscription',
      title: 'Subscription Activated',
      description: 'Vanguard Systems activated Enterprise Annual Tier',
      timestamp: '45m ago',
      amount: '$36,000 / yr',
      status: 'Active',
    },
    {
      id: 'act-3',
      type: 'invoice',
      title: 'Invoice Generated',
      description: 'Automated billing cycle generated INV-2026-090 for Helios AI',
      timestamp: '2h ago',
      amount: '$4,800.00',
      status: 'Issued',
    },
    {
      id: 'act-4',
      type: 'customer',
      title: 'New Customer Registered',
      description: 'Quantum Cloud Ltd created corporate billing profile',
      timestamp: '4h ago',
      status: 'Verified',
    },
  ];

  const activities = isDemoMode ? demoActivities : [];

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'payment':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'subscription':
        return <Repeat className="h-4 w-4 text-loopnex-electricTeal" />;
      case 'invoice':
        return <FileCheck className="h-4 w-4 text-loopnex-softCyan" />;
      case 'customer':
        return <UserPlus className="h-4 w-4 text-loopnex-violetAccent" />;
    }
  };

  return (
    <Card className="col-span-full xl:col-span-4">
      <CardHeader>
        <div>
          <CardTitle>Recent Event Stream</CardTitle>
          <CardDescription>Real-time lifecycle & ledger audit log</CardDescription>
        </div>
        {isDemoMode && (
          <Badge variant="amber" size="sm">
            Demo Feed
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-loopnex-surface text-slate-400 mb-2">
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
              No Operational Events Recorded
            </p>
            <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText max-w-xs mt-1">
              Customer registrations, activations, invoices and payments will stream here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-loopnex-surfaceBorder/60 hover:bg-slate-50 dark:hover:bg-loopnex-surface/40 transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-loopnex-surface border border-slate-200 dark:border-loopnex-surfaceBorder/60">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-loopnex-secondaryText shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                  {item.amount && (
                    <span className="inline-block text-[11px] font-semibold text-slate-800 dark:text-loopnex-primaryText mt-1">
                      {item.amount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
