import { useOutletContext, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Users,
  Repeat,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { StaffOverviewData } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffDashboardPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<StaffOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load staff overview data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Overview"
        subtitle={`Welcome back, ${user?.fullName || 'Sarah'}. Here is your operations pulse.`}
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Quick filter activities, pending tasks, or accounts..."
      />

      {/* 6 Pastel Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Assigned Customers - Soft Blue */}
        <div
          onClick={() => navigate('/staff/customers')}
          className="rounded-2xl p-4.5 bg-[#E2F0FC] border border-[#A9D4F5]/40 hover:border-[#A9D4F5] transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#1E3A8A] uppercase">
              Assigned Customers
            </span>
            <div className="p-2 rounded-xl bg-white/70 text-[#1E3A8A] group-hover:bg-white transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {loading ? '...' : overview?.assignedCustomers || 8}
          </div>
          <p className="text-[11px] text-[#1E3A8A]/80 font-medium mt-1">Enterprise & Mid-Market</p>
        </div>

        {/* 2. Active Subscriptions - Soft Green */}
        <div
          onClick={() => navigate('/staff/subscriptions')}
          className="rounded-2xl p-4.5 bg-[#DDF0E1] border border-[#86EFAC]/40 hover:border-[#86EFAC] transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#14532D] uppercase">
              Active Subs
            </span>
            <div className="p-2 rounded-xl bg-white/70 text-[#14532D] group-hover:bg-white transition-colors">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {loading ? '...' : overview?.activeSubscriptions || 6}
          </div>
          <p className="text-[11px] text-[#14532D]/80 font-medium mt-1">96.8% renewal telemetry</p>
        </div>

        {/* 3. Pending Quotations - Soft Yellow */}
        <div
          onClick={() => navigate('/staff/quotations')}
          className="rounded-2xl p-4.5 bg-[#F5EFD8] border border-[#FDE047]/40 hover:border-[#FDE047] transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#713F12] uppercase">
              Pending Quotes
            </span>
            <div className="p-2 rounded-xl bg-white/70 text-[#713F12] group-hover:bg-white transition-colors">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {loading ? '...' : overview?.pendingQuotations || 3}
          </div>
          <p className="text-[11px] text-[#713F12]/80 font-medium mt-1">Awaiting client decision</p>
        </div>

        {/* 4. Pending Invoices - Soft Lavender */}
        <div
          onClick={() => navigate('/staff/invoices')}
          className="rounded-2xl p-4.5 bg-[#EAE3F4] border border-[#D8B4FE]/40 hover:border-[#D8B4FE] transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#581C87] uppercase">
              Pending Invoices
            </span>
            <div className="p-2 rounded-xl bg-white/70 text-[#581C87] group-hover:bg-white transition-colors">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#171717]">
            {loading ? '...' : overview?.pendingInvoices || 2}
          </div>
          <p className="text-[11px] text-[#581C87]/80 font-medium mt-1">Confirmed & open balance</p>
        </div>

        {/* 5. Payments Collected - Soft Blue */}
        <div
          onClick={() => navigate('/staff/payments')}
          className="rounded-2xl p-4.5 bg-[#E2F0FC] border border-[#A9D4F5]/40 hover:border-[#A9D4F5] transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#1E3A8A] uppercase">
              Collected
            </span>
            <div className="p-2 rounded-xl bg-white/70 text-[#1E3A8A] group-hover:bg-white transition-colors">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#171717] truncate">
            {loading ? '...' : formatCurrency(overview?.paymentsCollected || 85150)}
          </div>
          <p className="text-[11px] text-[#1E3A8A]/80 font-medium mt-1">Cleared transactions</p>
        </div>

        {/* 6. Overdue Invoices - Soft Yellow */}
        <div
          onClick={() => navigate('/staff/invoices')}
          className="rounded-2xl p-4.5 bg-[#F5EFD8] border border-[#FDE047]/40 hover:border-[#FDE047] transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#713F12] uppercase">
              Overdue
            </span>
            <div className="p-2 rounded-xl bg-white/70 text-[#713F12] group-hover:bg-white transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {loading ? '...' : overview?.overdueInvoices || 1}
          </div>
          <p className="text-[11px] text-[#713F12]/80 font-medium mt-1">Needs payment follow-up</p>
        </div>
      </div>

      {/* Main Grid: Visualizations & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Subscription Overview & Monthly Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Overview Card */}
          <div className="rounded-3xl border border-[#E9EDF2] p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Subscription Overview</h2>
                <p className="text-xs text-[#7B8493]">
                  Recurring volume performance and portfolio trajectory
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DDF0E1] text-[#14532D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Portfolio Healthy
                </span>
              </div>
            </div>

            {/* Quick Metrics Sub-Row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                <p className="text-[11px] font-medium text-[#7B8493]">Active Subscriptions</p>
                <p className="text-lg font-bold text-[#171717] mt-0.5">142</p>
                <span className="text-[10px] text-emerald-600 font-semibold">+8% from last month</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                <p className="text-[11px] font-medium text-[#7B8493]">Expiring Next 30 Days</p>
                <p className="text-lg font-bold text-[#171717] mt-0.5">12</p>
                <span className="text-[10px] text-amber-600 font-semibold">Renewal playbook queued</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                <p className="text-[11px] font-medium text-[#7B8493]">Recently Activated</p>
                <p className="text-lg font-bold text-[#171717] mt-0.5">8</p>
                <span className="text-[10px] text-blue-600 font-semibold">Onboarding in progress</span>
              </div>
            </div>

            {/* Minimalist Chart */}
            <div className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={overview?.subscriptionTrends || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A9D4F5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#A9D4F5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#7B8493' }}
                    axisLine={{ stroke: '#E9EDF2' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#7B8493' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E9EDF2',
                      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name="Active Subscriptions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Operational Tasks */}
          <div className="rounded-3xl border border-[#E9EDF2] p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Pending Tasks</h2>
                <p className="text-xs text-[#7B8493]">Action items requiring immediate operational review</p>
              </div>
              <span className="text-xs text-[#7B8493] font-medium">
                {overview?.pendingTasks?.length || 4} items pending
              </span>
            </div>

            <div className="space-y-3">
              {(overview?.pendingTasks || []).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-[#E9EDF2] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        task.urgency === 'high'
                          ? 'bg-rose-500'
                          : task.urgency === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#171717]">{task.title}</p>
                      <p className="text-[11px] text-[#7B8493] truncate">{task.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(task.targetPath)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#E9EDF2] hover:border-slate-300 text-xs font-semibold text-[#171717] shadow-sm hover:bg-slate-50 transition-all"
                  >
                    <span>{task.actionLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#7B8493]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Operational Activities */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E9EDF2] p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Recent Activities</h2>
                <p className="text-xs text-[#7B8493]">Chronological operations log</p>
              </div>
              <button
                onClick={loadData}
                className="p-1.5 rounded-xl border border-[#E9EDF2] text-[#7B8493] hover:text-[#171717] hover:bg-slate-50 transition-colors"
                title="Refresh feed"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(overview?.recentActivities || []).map((activity) => (
                <div
                  key={activity.id}
                  className="p-3.5 rounded-2xl border border-[#E9EDF2] bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171717]">{activity.title}</span>
                    <span className="text-[10px] text-[#7B8493]">{activity.time}</span>
                  </div>
                  <p className="text-xs text-[#7B8493] leading-relaxed">{activity.description}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#E2F0FC] text-[#1E3A8A]">
                      {activity.badge}
                    </span>
                    <span className="text-[10px] text-[#7B8493] font-medium capitalize">
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Footer Box */}
            <div className="pt-2 border-t border-[#E9EDF2]">
              <div className="p-3.5 rounded-2xl bg-[#E2F0FC]/50 border border-[#A9D4F5]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                  <Sparkles className="h-4 w-4" />
                  <span>Rapid Operations</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate('/staff/quotations')}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-white text-xs font-medium text-[#171717] hover:bg-slate-50 border border-[#E9EDF2] shadow-sm transition-colors"
                  >
                    + New Quotation
                  </button>
                  <button
                    onClick={() => navigate('/staff/payments')}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-white text-xs font-medium text-[#171717] hover:bg-slate-50 border border-[#E9EDF2] shadow-sm transition-colors"
                  >
                    + Record Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
