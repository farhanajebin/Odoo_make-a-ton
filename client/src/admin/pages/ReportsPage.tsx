import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { useAdminData } from '../context/AdminDataContext';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';

const REPORT_DATA = [
  { period: 'Jan', revenue: 38000, collections: 35000, newSubs: 24 },
  { period: 'Feb', revenue: 42000, collections: 41000, newSubs: 29 },
  { period: 'Mar', revenue: 51000, collections: 49000, newSubs: 35 },
  { period: 'Apr', revenue: 58000, collections: 56000, newSubs: 42 },
  { period: 'May', revenue: 64000, collections: 61000, newSubs: 48 },
  { period: 'Jun', revenue: 72000, collections: 69000, newSubs: 55 },
];

export const ReportsPage: React.FC = () => {
  const { subscriptions, invoices, payments, showToast } = useAdminData();
  const [dateRange, setDateRange] = useState<'7D' | '30D' | 'Q3' | 'YTD' | 'ALL'>('30D');

  const activeSubs = subscriptions.filter((s) => s.status === 'Active').length;
  const totalRevenue = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + i.total, 0);
  const totalCollected = payments
    .filter((p) => p.status === 'Completed')
    .reduce((acc, p) => acc + p.amount, 0);
  const outstandingAmount = invoices
    .filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((acc, i) => acc + i.balanceDue, 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Period,Revenue,Collections,NewSubscriptions\n' +
      REPORT_DATA.map((r) => `${r.period},${r.revenue},${r.collections},${r.newSubs}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loopnex_fiscal_report_${dateRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fiscal telemetry report exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          {(['7D', '30D', 'Q3', 'YTD', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateRange === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </AdminButton>
          <AdminButton
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export Report
          </AdminButton>
        </div>
      </div>

      {/* 5 High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminCard variant="sky" padding="sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Total Revenue
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Paid receivables</p>
        </AdminCard>

        <AdminCard variant="mint" padding="sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Active Subscriptions
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeSubs} agreements</div>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">99.1% retained</p>
        </AdminCard>

        <AdminCard variant="amber" padding="sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Payments Received
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            ${totalCollected.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Direct collections</p>
        </AdminCard>

        <AdminCard variant="default" padding="sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Outstanding Amount
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            ${outstandingAmount.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Pending settlement</p>
        </AdminCard>

        <AdminCard variant="default" padding="sm" className="border-rose-200 bg-rose-50/20">
          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">
            Overdue Invoices
          </span>
          <div className="text-xl font-bold text-rose-700 mt-1">
            {overdueInvoices.length} (${overdueAmount.toLocaleString()})
          </div>
          <p className="text-[10px] text-rose-600 mt-0.5">Dunning escalation required</p>
        </AdminCard>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Bar Chart - Monthly Invoiced vs Collected */}
        <div className="lg:col-span-8">
          <AdminCard variant="default" padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Billing vs Settlement Trajectory
                </h4>
                <p className="text-xs text-slate-500">
                  Comparison of monthly invoiced volume against received collections
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Range: {dateRange}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REPORT_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" name="Invoiced" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="collections" name="Collected" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </div>

        {/* Right: Net New Subscriptions Area Curve */}
        <div className="lg:col-span-4">
          <AdminCard variant="default" padding="md" className="flex flex-col justify-between h-full">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Subscription Growth</h4>
              <p className="text-xs text-slate-500">New customer contracts per monthly cohort</p>
            </div>

            <div className="h-44 w-full my-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REPORT_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="newSubs"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-900">Total Net Expansion</span>
              <span className="font-bold text-purple-950">+233 accounts</span>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
};
