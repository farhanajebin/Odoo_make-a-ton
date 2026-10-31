import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerBadge } from '../components/common/CustomerBadge';

export const PaymentsPage: React.FC = () => {
  const { payments, profile, showToast } = useCustomerData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSettled = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Settlement Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CustomerCard variant="mint" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Successful Payments
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(totalSettled)}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Verified inward settlements</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </CustomerCard>

        <CustomerCard variant="sky" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Transactions Count
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {payments.length} settled
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">100% gateway success rate</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-blue-700">
            <CreditCard className="w-5 h-5" />
          </div>
        </CustomerCard>

        <CustomerCard variant="default" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Primary Payment Channel
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">UPI Auto-Debit</div>
            <p className="text-[11px] text-slate-500 mt-0.5">HDFC Corporate Gateway</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </CustomerCard>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by transaction reference or invoice..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Transactions</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Records for: {profile.company}
        </div>
      </div>

      {/* Payment History Table */}
      <CustomerCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Payment Reference #</th>
                <th className="py-3.5 px-4">Associated Invoice</th>
                <th className="py-3.5 px-4">Settlement Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-semibold text-slate-900">
                      {p.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{p.paymentDate}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <CustomerBadge statusText={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          showToast(`Payment receipt for ${p.referenceNumber} downloaded`, 'success')
                        }
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline inline-flex items-center gap-1"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CustomerCard>
    </div>
  );
};
