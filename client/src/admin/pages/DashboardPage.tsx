import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Repeat,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAdminData } from '../context/AdminDataContext';
import { AdminCard } from '../components/common/AdminCard';
import { AdminStatCard } from '../components/common/AdminStatCard';
import { AdminBadge } from '../components/common/AdminBadge';

const REVENUE_DATA = [
  { time: 'May', revenue: 142000, mrr: 28000 },
  { time: 'Jun', revenue: 168000, mrr: 32000 },
  { time: 'Jul', revenue: 195000, mrr: 39000 },
  { time: 'Aug', revenue: 215000, mrr: 44000 },
  { time: 'Sep', revenue: 248000, mrr: 51000 },
  { time: 'Oct', revenue: 284500, mrr: 58200 },
];

export const DashboardPage: React.FC = () => {
  const { customers, subscriptions, invoices, payments, showToast } = useAdminData();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState<'1W' | '1M' | '1Y' | 'ALL'>('1M');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'payments'>('subscriptions');

  // Compute Metrics
  const totalCustomers = customers.length;
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active').length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.total, 0);
  const paymentsReceived = payments
    .filter((p) => p.status === 'Completed')
    .reduce((acc, p) => acc + p.amount, 0);
  const outstandingAmount = invoices
    .filter((inv) => inv.status !== 'Paid' && inv.status !== 'Cancelled')
    .reduce((acc, inv) => acc + inv.balanceDue, 0);
  const overdueInvoices = invoices.filter((inv) => inv.status === 'Overdue');
  const overdueAmount = overdueInvoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Reference-Matched Portfolio Card on Left + 3 Pastel Asset Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Sky Blue "Revenue & Portfolio" Hero Card */}
        <div className="lg:col-span-6 xl:col-span-5">
          <AdminCard variant="sky" padding="md" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Revenue
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  +18.4% YOY
                </span>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(totalRevenue || 284500)}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Combined platform collections & recurring billing
              </p>
            </div>

            {/* Area Chart Spline */}
            <div className="h-36 w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#skyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Time Filter Pills matching reference screenshot */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-200/60">
              <span className="text-xs font-medium text-slate-600">MRR: $58,200/mo</span>
              <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-blue-100">
                {(['1W', '1M', '1Y', 'ALL'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeline(t)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                      timeline === t
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Right Column: 3 Pastel Cards (Lavender, Mint, Warm Sand) */}
        <div className="lg:col-span-6 xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Lavender - Customers */}
          <AdminStatCard
            variant="lavender"
            title="Total Customers"
            value={totalCustomers.toString()}
            subtitle="Active accounts"
            icon={<Users className="w-4 h-4 text-purple-700" />}
            trend={{ value: '+14.2%', isPositive: true }}
            onOptionsClick={() => navigate('/admin/customers')}
          />

          {/* Card 2: Mint - Active Subscriptions */}
          <AdminStatCard
            variant="mint"
            title="Active Subscriptions"
            value={activeSubscriptions.toString()}
            subtitle="Live contracts"
            icon={<Repeat className="w-4 h-4 text-emerald-700" />}
            trend={{ value: '+8.5%', isPositive: true }}
            onOptionsClick={() => navigate('/admin/subscriptions')}
          />

          {/* Card 3: Warm Sand - Payments Received */}
          <AdminStatCard
            variant="amber"
            title="Payments Received"
            value={formatCurrency(paymentsReceived)}
            subtitle="Settled transactions"
            icon={<DollarSign className="w-4 h-4 text-amber-700" />}
            trend={{ value: '+12.1%', isPositive: true }}
            onOptionsClick={() => navigate('/admin/payments')}
          />
        </div>
      </div>

      {/* Secondary Metrics Row: Outstanding Amount & Overdue Invoices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard variant="default" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Outstanding Amount</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {formatCurrency(outstandingAmount)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pending collection</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </AdminCard>

        <AdminCard variant="default" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Overdue Invoices</span>
            <div className="text-xl font-bold text-rose-600 mt-1">
              {overdueInvoices.length} invoices
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{formatCurrency(overdueAmount)} unpaid</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </AdminCard>

        <AdminCard variant="default" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Average Ticket</span>
            <div className="text-xl font-bold text-slate-900 mt-1">$4,850</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">↑ 6.4% this quarter</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </AdminCard>

        <AdminCard variant="default" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Renewal Health</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">98.2%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated auto-renew</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </AdminCard>
      </div>

      {/* Bottom Section: Operations Ledger Tabs on Left + Dark Intelligence Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Clean Table with Subscriptions / Invoices / Payments */}
        <div className="lg:col-span-8">
          <AdminCard variant="default" padding="none">
            {/* Table Header with Tabs */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Operational Activity</h3>
                <p className="text-xs text-slate-500">Live records from subscriptions and cash flows</p>
              </div>

              {/* Pill Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'subscriptions'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Recent Subscriptions
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'invoices'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Recent Invoices
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'payments'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Recent Payments
                </button>
              </div>
            </div>

            {/* Active Table Content */}
            <div className="overflow-x-auto">
              {activeTab === 'subscriptions' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Subscription</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {subscriptions.slice(0, 5).map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {sub.subscriptionNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{sub.customerName}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {sub.planName} ({sub.frequency})
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {formatCurrency(sub.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <AdminBadge statusText={sub.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate('/admin/subscriptions')}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                          >
                            Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'invoices' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {invoices.slice(0, 5).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{inv.customerName}</td>
                        <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="py-3.5 px-4">
                          <AdminBadge statusText={inv.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate('/admin/invoices')}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'payments' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Reference</th>
                      <th className="py-3 px-4">Invoice</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {payments.slice(0, 5).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">{p.referenceNumber}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-medium">{p.customerName}</td>
                        <td className="py-3.5 px-4 text-slate-500">{p.method}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-700">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <AdminBadge statusText={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right Column (4 cols): Dark Quick Action Card (Matching the Reference UI Promo Card) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <AdminCard variant="dark" padding="md" className="flex flex-col justify-between relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-slate-700/40 pointer-events-none" />
            <div className="absolute -right-2 -bottom-2 w-28 h-28 rounded-full border border-teal-500/20 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Quick Actions
                </span>
                <span className="text-xs text-slate-400">Admin Control</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                Subscription Operations Hub
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Execute core business workflows, trigger dunning procedures, or issue quotes directly.
              </p>
            </div>

            {/* Quick Action Button Grid */}
            <div className="space-y-2 mt-5 z-10">
              <button
                onClick={() => navigate('/admin/quotations')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                  <span>Create New Quotation</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/subscriptions')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  <span>Draft Subscription</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/invoices')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Issue Manual Invoice</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/customers')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Register Customer</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </AdminCard>

          {/* Overdue Alert Strip */}
          {overdueInvoices.length > 0 && (
            <AdminCard variant="default" padding="sm" className="border-rose-200 bg-rose-50/40">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-rose-900">
                    {overdueInvoices.length} Overdue Receivables Alert
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    {formatCurrency(overdueAmount)} is past due date. Dunning emails are recommended.
                  </p>
                  <button
                    onClick={() => {
                      showToast('Dunning reminders queued for overdue accounts', 'info');
                    }}
                    className="mt-2 text-xs font-bold text-rose-800 underline hover:text-rose-950"
                  >
                    Send Dunning Notices →
                  </button>
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
};
