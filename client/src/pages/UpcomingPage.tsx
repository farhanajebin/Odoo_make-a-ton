import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { NAVIGATION_ITEMS } from '../constants/navigation';

export const UpcomingPage: React.FC = () => {
  const location = useLocation();
  const currentNav = NAVIGATION_ITEMS.find((item) => item.path === location.pathname);

  const title = currentNav?.name || 'Upcoming SaaS Module';
  const description = currentNav?.description || 'This module is scheduled for future development milestones.';
  const badge = currentNav?.badge || 'Upcoming';

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-loopnex-secondaryText hover:text-slate-900 dark:hover:text-loopnex-primaryText transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Business Overview
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-loopnex-graphite p-8 text-white relative">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="teal" size="md">
              {badge}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">Status: Planned Architecture</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {title}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            {description}
          </p>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-loopnex-electricTeal" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-loopnex-primaryText">
                Architectural Readiness
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-loopnex-secondaryText leading-relaxed">
              In accordance with COMMIT 01 guidelines, this module&apos;s data contracts, relations, and database models have been prepared in Prisma ORM, while reserving domain business logic and execution handlers for its dedicated development milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Data Schema Defined
              </div>
              <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText">
                PostgreSQL tables, foreign keys, timestamps and precision Decimal financial types established.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText mb-2">
                <ShieldCheck className="h-4 w-4 text-loopnex-softCyan" />
                Security & Role Boundaries
              </div>
              <p className="text-[11px] text-slate-500 dark:text-loopnex-secondaryText">
                Role-based access foundation prepared with granular permissions JSON structure.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <Link to="/">
              <Button variant="primary" size="sm" icon={<Layers className="h-3.5 w-3.5" />}>
                Return to Live Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
