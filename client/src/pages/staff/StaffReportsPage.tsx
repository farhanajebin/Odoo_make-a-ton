import { Printer } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { StaffReportsData } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffReportsPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();

  const [reports, setReports] = useState<StaffReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'subscriptions' | 'quotations' | 'invoices' | 'payments'>('customers');
  const [dateRange, setDateRange] = useState('30d');

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Operational Reports"
        subtitle="Operational telemetry and performance breakdowns across your assigned portfolio"
        onToggleMobileMenu={onToggleMobileMenu}
      />

      {/* Top Filter and Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
        {/* Report Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'customers'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-white text-[#7B8493] hover:text-[#171717] border border-[#E9EDF2]'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-white text-[#7B8493] hover:text-[#171717] border border-[#E9EDF2]'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'quotations'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-white text-[#7B8493] hover:text-[#171717] border border-[#E9EDF2]'
            }`}
          >
            Quotations
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-white text-[#7B8493] hover:text-[#171717] border border-[#E9EDF2]'
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-white text-[#7B8493] hover:text-[#171717] border border-[#E9EDF2]'
            }`}
          >
            Payments
          </button>
        </div>

        {/* Date Selector & Print */}
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
          >
            <option value="30d">Last 30 Days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">Current Fiscal Year</option>
          </select>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9EDF2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#171717] shadow-sm transition-all"
          >
            <Printer className="h-3.5 w-3.5 text-[#7B8493]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#7B8493] text-sm">
          Aggregating operational reports...
        </div>
      ) : reports ? (
        <div className="space-y-6">
          {/* TAB 1: CUSTOMERS REPORT */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#E2F0FC] border border-[#A9D4F5]/40">
                  <span className="text-[11px] font-semibold text-[#1E3A8A] uppercase">Assigned Accounts</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">
                    {reports.assignedCustomerReport.totalAccounts}
                  </p>
                  <span className="text-[11px] text-[#1E3A8A]/80 font-medium">100% portfolio coverage</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40">
                  <span className="text-[11px] font-semibold text-[#14532D] uppercase">Active Engagement Rate</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">
                    {reports.assignedCustomerReport.activeRate}%
                  </p>
                  <span className="text-[11px] text-[#14532D]/80 font-medium">Regular billing frequency</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#EAE3F4] border border-[#D8B4FE]/40">
                  <span className="text-[11px] font-semibold text-[#581C87] uppercase">Account Health Score</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">
                    {reports.assignedCustomerReport.healthScore} / 100
                  </p>
                  <span className="text-[11px] text-[#581C87]/80 font-medium">Low churn telemetry</span>
                </div>
              </div>

              {/* Tier breakdown chart and table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl border border-[#E9EDF2] bg-white shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-[#171717]">Account Tier Distribution</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reports.assignedCustomerReport.distribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#7B8493' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#7B8493' }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Accounts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-[#E9EDF2] bg-white shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-[#171717]">Revenue Contribution by Tier</h3>
                  <div className="space-y-3">
                    {reports.assignedCustomerReport.distribution.map((tier) => (
                      <div key={tier.tier} className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#171717] block">{tier.tier} Tier</span>
                          <span className="text-[11px] text-[#7B8493]">{tier.count} corporate clients</span>
                        </div>
                        <span className="font-bold text-sm text-[#171717]">{formatCurrency(tier.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTIONS REPORT */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40">
                  <span className="text-[11px] font-semibold text-[#14532D] uppercase">Active Subscriptions</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{reports.subscriptionReport.totalActive}</p>
                  <span className="text-[11px] text-[#14532D]/80 font-medium">Running contracts</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#E2F0FC] border border-[#A9D4F5]/40">
                  <span className="text-[11px] font-semibold text-[#1E3A8A] uppercase">Normalized Monthly (MRR)</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{formatCurrency(reports.subscriptionReport.mrr)}</p>
                  <span className="text-[11px] text-[#1E3A8A]/80 font-medium">Operational run rate</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#EAE3F4] border border-[#D8B4FE]/40">
                  <span className="text-[11px] font-semibold text-[#581C87] uppercase">Renewal Success Rate</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{reports.subscriptionReport.renewalRate}%</p>
                  <span className="text-[11px] text-[#581C87]/80 font-medium">Retention benchmark</span>
                </div>
              </div>

              {/* Plans table */}
              <div className="p-6 rounded-3xl border border-[#E9EDF2] bg-white shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#171717]">Subscription Plans Breakdown</h3>
                <div className="space-y-2">
                  {reports.subscriptionReport.plans.map((p) => (
                    <div key={p.plan} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                      <div>
                        <span className="font-bold text-xs text-[#171717] block">{p.plan}</span>
                        <span className="text-[11px] text-[#7B8493]">{p.count} active deployments</span>
                      </div>
                      <span className="font-bold text-xs text-[#171717]">{formatCurrency(p.mrr)} / mo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUOTATIONS REPORT */}
          {activeTab === 'quotations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F5EFD8] border border-[#FDE047]/40">
                  <span className="text-[11px] font-semibold text-[#713F12] uppercase">Total Quotes Created</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{reports.quotationReport.totalCreated}</p>
                  <span className="text-[11px] text-[#713F12]/80 font-medium">CPQ proposals</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#E2F0FC] border border-[#A9D4F5]/40">
                  <span className="text-[11px] font-semibold text-[#1E3A8A] uppercase">Pipeline Quote Value</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{formatCurrency(reports.quotationReport.totalValue)}</p>
                  <span className="text-[11px] text-[#1E3A8A]/80 font-medium">Total proposed volume</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40">
                  <span className="text-[11px] font-semibold text-[#14532D] uppercase">CPQ Win Rate</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{reports.quotationReport.winRate}%</p>
                  <span className="text-[11px] text-[#14532D]/80 font-medium">Accepted conversion rate</span>
                </div>
              </div>

              {/* Status table */}
              <div className="p-6 rounded-3xl border border-[#E9EDF2] bg-white shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#171717]">Quotation Status Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(reports.quotationReport.statusCounts).map(([status, count]) => (
                    <div key={status} className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2] text-center">
                      <span className="text-[10px] font-bold text-[#7B8493] uppercase block">{status}</span>
                      <span className="text-xl font-bold text-[#171717] mt-0.5 block">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVOICES REPORT */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#E2F0FC] border border-[#A9D4F5]/40">
                  <span className="text-[11px] font-semibold text-[#1E3A8A] uppercase">Total Invoiced</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{formatCurrency(reports.invoiceReport.totalInvoiced)}</p>
                  <span className="text-[11px] text-[#1E3A8A]/80 font-medium">Gross billing volume</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40">
                  <span className="text-[11px] font-semibold text-[#14532D] uppercase">Collected</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{formatCurrency(reports.invoiceReport.totalCollected)}</p>
                  <span className="text-[11px] text-[#14532D]/80 font-medium">Settled to bank ledger</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5EFD8] border border-[#FDE047]/40">
                  <span className="text-[11px] font-semibold text-[#713F12] uppercase">Days Sales Outstanding</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{reports.invoiceReport.dsoDays} Days</p>
                  <span className="text-[11px] text-[#713F12]/80 font-medium">Healthy collection cycle</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS REPORT */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#DDF0E1] border border-[#86EFAC]/40">
                  <span className="text-[11px] font-semibold text-[#14532D] uppercase">Total Volume Cleared</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">{formatCurrency(reports.paymentReport.totalVolume)}</p>
                  <span className="text-[11px] text-[#14532D]/80 font-medium">{reports.paymentReport.count} transactions</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#E2F0FC] border border-[#A9D4F5]/40">
                  <span className="text-[11px] font-semibold text-[#1E3A8A] uppercase">Settlement Success Rate</span>
                  <p className="text-2xl font-bold text-[#171717] mt-1">100%</p>
                  <span className="text-[11px] text-[#1E3A8A]/80 font-medium">Zero chargebacks or disputes</span>
                </div>
              </div>

              {/* Methods Breakdown */}
              <div className="p-6 rounded-3xl border border-[#E9EDF2] bg-white shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#171717]">Settlement Method Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(reports.paymentReport.byMethod).map(([method, volume]) => (
                    <div key={method} className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                      <span className="text-[10px] font-bold text-[#7B8493] uppercase block">{method.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-[#171717] mt-0.5 block">{formatCurrency(volume)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
