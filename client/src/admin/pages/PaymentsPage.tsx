import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Payment, PaymentMethod } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

export const PaymentsPage: React.FC = () => {
  const { payments, invoices, addPayment, deletePayment } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Form State
  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(unpaidInvoices[0]?.id || invoices[0]?.id || '');
  const [amount, setAmount] = useState<number>(unpaidInvoices[0]?.balanceDue || 500);
  const [method, setMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setAmount(inv.balanceDue || inv.total);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) return;

    addPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: Number(amount),
      paymentDate: new Date().toISOString().split('T')[0],
      method,
      notes,
      status: 'Completed',
    });

    setIsAddModalOpen(false);
    setNotes('');
  };

  const totalCollected = payments
    .filter((p) => p.status === 'Completed')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = invoices
    .filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((acc, i) => acc + i.balanceDue, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'All' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminCard variant="mint" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Settled</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ${totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Completed transactions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </AdminCard>

        <AdminCard variant="amber" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Outstanding Receivables</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ${totalPending.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Awaiting customer clearance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </AdminCard>

        <AdminCard variant="default" padding="sm" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Payment Success Rate</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">99.4%</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Stripe & Direct Debit Health</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <CreditCard className="w-5 h-5" />
          </div>
        </AdminCard>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payments by reference, invoice, or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="ACH Direct Debit">ACH Direct Debit</option>
            <option value="UPI">UPI</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Record Payment
        </AdminButton>
      </div>

      {/* Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Reference #</th>
                <th className="py-3.5 px-4">Associated Invoice</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Settlement Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-semibold text-slate-900">
                      {p.referenceNumber}
                      {p.notes && <div className="text-[10px] text-slate-400 font-sans mt-0.5">{p.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{p.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{p.paymentDate}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ${p.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setPaymentToDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Record Payment Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Payment Settlement"
        subtitle="Reconcile an incoming payment against an outstanding invoice"
        maxWidth="md"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleRecordPayment}>
              Record Payment
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Invoice to Reconcile *
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName} (${inv.balanceDue > 0 ? `Due: $${inv.balanceDue}` : 'Paid'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Amount ($) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="ACH Direct Debit">ACH Direct Debit</option>
                <option value="UPI">UPI</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Notes / Gateway Auth ID
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Auth ID #ch_3Okj294829 — cleared"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={() => {
          if (paymentToDelete) {
            deletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        title="Delete Payment Record"
        message={`Are you sure you want to delete payment record ${paymentToDelete?.referenceNumber}?`}
        confirmText="Delete Record"
        type="danger"
      />
    </div>
  );
};
