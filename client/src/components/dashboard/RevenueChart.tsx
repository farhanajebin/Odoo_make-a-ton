import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  isDemoMode: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ isDemoMode }) => {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '12M' | 'YTD'>('12M');

  // Realistic sample monthly revenue trajectory
  const demoData = [
    { month: 'Jan', mrr: 112000, expansion: 8400, churn: 2100, net: 118300 },
    { month: 'Feb', mrr: 119500, expansion: 9200, churn: 1800, net: 126900 },
    { month: 'Mar', mrr: 127000, expansion: 10400, churn: 2400, net: 135000 },
    { month: 'Apr', mrr: 134200, expansion: 11800, churn: 1900, net: 144100 },
    { month: 'May', mrr: 142800, expansion: 12500, churn: 2200, net: 153100 },
    { month: 'Jun', mrr: 150400, expansion: 13100, churn: 1600, net: 161900 },
    { month: 'Jul', mrr: 158900, expansion: 14200, churn: 2000, net: 171100 },
    { month: 'Aug', mrr: 166200, expansion: 15600, churn: 2500, net: 179300 },
    { month: 'Sep', mrr: 173500, expansion: 16100, churn: 1900, net: 187700 },
    { month: 'Oct', mrr: 184520, expansion: 17800, churn: 1750, net: 200570 },
  ];

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Revenue Velocity & MRR Expansion</CardTitle>
            {isDemoMode && (
              <Badge variant="amber" size="sm">
                Demonstration Model
              </Badge>
            )}
          </div>
          <CardDescription>
            Recurring revenue trajectory, expansion momentum, and net retention
          </CardDescription>
        </div>

        {/* Time-Range Selector Buttons */}
        <div className="flex items-center rounded-lg bg-slate-100 dark:bg-loopnex-surface p-1 border border-slate-200 dark:border-loopnex-surfaceBorder text-xs">
          {(['30D', '90D', '12M', 'YTD'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-loopnex-graphite text-slate-900 dark:text-loopnex-primaryText shadow-xs'
                  : 'text-slate-500 dark:text-loopnex-secondaryText hover:text-slate-800 dark:hover:text-loopnex-primaryText'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-5">
        {/* Revenue Legend */}
        <div className="flex items-center gap-5 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-loopnex-electricTeal" />
            <span className="text-slate-600 dark:text-loopnex-secondaryText">Monthly Recurring Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-loopnex-violetAccent" />
            <span className="text-slate-600 dark:text-loopnex-secondaryText">Net Revenue with Expansion</span>
          </div>
        </div>

        {!isDemoMode ? (
          // Pristine Zero-Data State
          <div className="flex flex-col items-center justify-center h-72 rounded-xl border border-dashed border-slate-200 dark:border-loopnex-surfaceBorder p-8 text-center bg-slate-50/50 dark:bg-loopnex-surface/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-loopnex-surface mb-3 text-slate-400">
              <BarChart3 className="h-6 w-6 text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-loopnex-primaryText">
              No Revenue Data Recorded
            </h4>
            <p className="text-xs text-slate-500 dark:text-loopnex-secondaryText max-w-sm mt-1 mb-4">
              Connect your billing contracts or switch to Demo Simulation Mode in the header to view revenue trajectories.
            </p>
          </div>
        ) : (
          // Render Live Interactive Chart
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27D3C2" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#27D3C2" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8175F5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8175F5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27384E" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#9AAABD"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27384E', opacity: 0.5 }}
                />
                <YAxis
                  stroke="#9AAABD"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-white dark:bg-loopnex-graphite p-3 shadow-xl text-xs">
                          <p className="font-semibold text-slate-900 dark:text-loopnex-primaryText mb-1.5">{label}</p>
                          <div className="space-y-1">
                            <p className="text-loopnex-electricTeal">
                              MRR: <span className="font-bold">{formatCurrency(payload[0].value as number)}</span>
                            </p>
                            <p className="text-loopnex-violetAccent">
                              Net Revenue: <span className="font-bold">{formatCurrency(payload[1].value as number)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#27D3C2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mrrGradient)"
                  name="Monthly Recurring Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#8175F5"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#netGradient)"
                  name="Net Total Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
