import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  CheckCircle2,
  Calendar,
  CreditCard,
  Eye,
  FileDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerStatCard } from '../components/common/CustomerStatCard';
import { CustomerBadge } from '../components/common/CustomerBadge';
import { CustomerModal } from '../components/common/CustomerModal';
import { CustomerInvoice } from '../types';

export const OverviewPage: React.FC = () => {
  const { subscription, invoices, payments, profile, downloadInvoicePDF } = useCustomerData();
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  // Compute stats
  const totalPaid = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const outstanding = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 5 Summary KPI Cards matching reference pastel styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Sky Blue - Current Plan */}
        <CustomerStatCard
          variant="sky"
          title="Current Plan"
          value={subscription.planName}
          subtitle={`${formatCurrency(subscription.basePrice)}/month base`}
          icon={<Zap className="w-4 h-4 text-blue-700" />}
          tag={{ text: 'Standard SLA', type: 'info' }}
          onClick={() => navigate('/customer/plans')}
        />

        {/* Card 2: Mint Green - Subscription Status */}
        <CustomerStatCard
          variant="mint"
          title="Subscription Status"
          value={subscription.status}
          subtitle="Auto-renewal active"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          tag={{ text: 'Active Cycle', type: 'positive' }}
          onClick={() => navigate('/customer/subscription')}
        />

        {/* Card 3: Warm Sand/Amber - Next Billing Date */}
        <CustomerStatCard
          variant="amber"
          title="Next Billing Date"
          value="Nov 28, 2026"
          subtitle={`${formatCurrency(subscription.totalAmount)} incl. taxes`}
          icon={<Calendar className="w-4 h-4 text-amber-700" />}
          tag={{ text: '28 Days Left', type: 'neutral' }}
          onClick={() => navigate('/customer/subscription')}
        />

        {/* Card 4: Lavender - Total Amount Paid */}
        <CustomerStatCard
          variant="lavender"
          title="Total Amount Paid"
          value={formatCurrency(totalPaid)}
          subtitle={`${payments.length} transactions settled`}
          icon={<CreditCard className="w-4 h-4 text-purple-700" />}
          onClick={() => navigate('/customer/payments')}
        />

        {/* Card 5: Neutral/Default - Outstanding Amount */}
        <CustomerStatCard
          variant="default"
          title="Outstanding Amount"
          value={formatCurrency(outstanding)}
          subtitle={outstanding === 0 ? 'Account fully reconciled' : 'Payment due'}
          icon={<ShieldCheck className="w-4 h-4 text-slate-700" />}
          tag={outstanding === 0 ? { text: 'Clear', type: 'positive' } : { text: 'Due', type: 'neutral' }}
          onClick={() => navigate('/customer/invoices')}
        />
      </div>

      {/* Main Grid: Current Subscription Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (8 cols): Current Subscription Detailed Summary */}
        <div className="lg:col-span-8">
          <CustomerCard variant="default" padding="md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Primary Agreement
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {subscription.productName}
                </h3>
                <p className="text-xs text-slate-500">
                  Subscription agreement #{subscription.subscriptionNumber} • Managed for {profile.company}
                </p>
              </div>
              <CustomerBadge statusText={subscription.status} />
            </div>

            {/* Grid of agreement properties */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">
                  Plan Tier
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {subscription.planName}
                </span>
                <span className="text-[10px] text-slate-500">{subscription.frequency} cycle</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">
                  Start Date
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {subscription.startDate}
                </span>
                <span className="text-[10px] text-slate-500">Active tenure</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">
                  Expiry / Renewal
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {subscription.expiryDate}
                </span>
                <span className="text-[10px] text-slate-500">Auto-renewal ON</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">
                  Total Monthly
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatCurrency(subscription.totalAmount)}
                </span>
                <span className="text-[10px] text-slate-500">Includes 18% GST</span>
              </div>
            </div>

            {/* Active Add-ons Strip */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Configured Add-ons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {subscription.addons.filter((a) => a.isEnabled).map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-medium"
                    >
                      {a.name} (+{formatCurrency(a.price)})
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/customer/plans')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0"
              >
                Customize Add-ons →
              </button>
            </div>
          </CustomerCard>
        </div>

        {/* Right (4 cols): Quick Actions Hub */}
        <div className="lg:col-span-4">
          <CustomerCard variant="dark" padding="md" className="h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-slate-700/40 pointer-events-none" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Self-Service
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-2">
                Quick Actions
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Seamlessly manage your billing agreements, statements, and feature tiers.
              </p>
            </div>

            <div className="space-y-2 mt-4 z-10">
              <button
                onClick={() => navigate('/customer/subscription')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  <span>View Subscription</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/customer/invoices')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-emerald-400" />
                  <span>View & Download Invoices</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/customer/plans')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Manage Add-ons</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/customer/payments')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>View Payment History</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </CustomerCard>
        </div>
      </div>

      {/* Bottom Grid: Recent Invoices on Left + Recent Payments on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Invoices Table (7 cols) */}
        <div className="lg:col-span-7">
          <CustomerCard variant="default" padding="none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Recent Invoices</h4>
                <p className="text-xs text-slate-500">Your latest billing statements & receipts</p>
              </div>
              <button
                onClick={() => navigate('/customer/invoices')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                All Invoices →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date / Due</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {invoices.slice(0, 3).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>{inv.issueDate}</div>
                        <div className="text-[10px]">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3 px-4">
                        <CustomerBadge statusText={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadInvoicePDF(inv.id)}
                          className="p-1 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Print / Download PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CustomerCard>
        </div>

        {/* Recent Payments Table (5 cols) */}
        <div className="lg:col-span-5">
          <CustomerCard variant="default" padding="none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Recent Payments</h4>
                <p className="text-xs text-slate-500">Settled inward transactions</p>
              </div>
              <button
                onClick={() => navigate('/customer/payments')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                All Payments →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Method / Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.slice(0, 3).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 font-mono text-[11px]">
                          {p.referenceNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">For {p.invoiceNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{p.method}</div>
                        <div className="text-[10px] text-slate-400">{p.paymentDate}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CustomerCard>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <CustomerModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Issued to ${profile.company}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <CustomerBadge statusText={selectedInvoice.status} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInvoicePDF(selectedInvoice.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" /> Print / Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Brightloop Technologies Ltd.</h4>
                <p className="text-slate-500">Subscription & Revenue Cloud</p>
                <p className="text-slate-500">GSTIN: 29AAACB1234F1ZQ</p>
              </div>
              <div className="text-right">
                <div className="text-slate-500">Issue Date: {selectedInvoice.issueDate}</div>
                <div className="text-slate-500">Due Date: {selectedInvoice.dueDate}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Billed Account
              </span>
              <div className="font-bold text-slate-900">{profile.company}</div>
              <div className="text-slate-600">{profile.address}</div>
              <div className="text-slate-500 mt-1">GSTIN: {profile.gstin}</div>
            </div>

            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Rate</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.lines.map((l, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium text-slate-900">{l.description}</td>
                    <td className="p-2.5 text-center">{l.quantity}</td>
                    <td className="p-2.5 text-right">{formatCurrency(l.unitPrice)}</td>
                    <td className="p-2.5 text-right font-semibold text-slate-900">{formatCurrency(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-1">
              <div className="w-64 space-y-1 text-right text-xs">
                <div className="text-slate-500">Subtotal: {formatCurrency(selectedInvoice.subtotal)}</div>
                <div className="text-slate-500">Taxes ({selectedInvoice.taxRate}% GST): {formatCurrency(selectedInvoice.taxTotal)}</div>
                <div className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  Total Paid: {formatCurrency(selectedInvoice.total)}
                </div>
              </div>
            </div>
          </div>
        </CustomerModal>
      )}
    </div>
  );
};
