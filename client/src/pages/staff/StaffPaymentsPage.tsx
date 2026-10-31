import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { PaymentItem, InvoiceItem } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffPaymentsPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Record Payment Modal
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [method, setMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD'>('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Payment Details Modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, invoicesData] = await Promise.all([
        staffApi.getPayments({ search: searchQuery, method: methodFilter }),
        staffApi.getInvoices(),
      ]);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, methodFilter]);

  // When selected invoice changes, update amount default to invoice balance
  const activeInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  const handleInvoiceSelect = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setAmount(inv.balanceDue);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedInvoiceId) {
      setFormError('Please select an invoice to apply payment.');
      return;
    }

    if (!reference.trim()) {
      setFormError('Please provide a transaction reference.');
      return;
    }

    if (amount <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    if (activeInvoice && amount > activeInvoice.balanceDue) {
      setFormError(`Payment amount ($${amount}) exceeds remaining balance due ($${activeInvoice.balanceDue}).`);
      return;
    }

    try {
      setSubmitting(true);
      await staffApi.recordPayment({
        invoiceId: selectedInvoiceId,
        method,
        reference: reference.trim(),
        amount,
        notes: notes || undefined,
      });

      setIsRecordOpen(false);
      setReference('');
      setNotes('');
      setSelectedInvoiceId('');
      setAmount(0);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'UPI':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E2F0FC] text-[#1E3A8A]">
            UPI
          </span>
        );
      case 'BANK_TRANSFER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EAE3F4] text-[#581C87]">
            Bank Wire
          </span>
        );
      case 'CARD':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#DDF0E1] text-[#14532D]">
            Credit Card
          </span>
        );
      case 'CASH':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-[#171717]">
            Cash
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Payment Operations"
        subtitle="Record settlement transactions, link invoice clearances, and inspect payment ledgers"
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search payments by transaction reference, customer, or invoice..."
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#7B8493]">Method Filter:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
          >
            <option value="ALL">All Methods</option>
            <option value="BANK_TRANSFER">Bank Wire</option>
            <option value="CARD">Credit Card</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
          </select>
        </div>

        <button
          onClick={() => {
            const unpaid = invoices.find((i) => i.balanceDue > 0);
            if (unpaid) {
              setSelectedInvoiceId(unpaid.id);
              setAmount(unpaid.balanceDue);
            }
            setIsRecordOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="rounded-3xl border border-[#E9EDF2] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9EDF2] bg-slate-50/75 text-[11px] font-bold text-[#7B8493] uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction Reference</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDF2] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7B8493]">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7B8493]">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#171717]">
                      {p.reference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      {p.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#7B8493]">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {getMethodBadge(p.method)}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDF0E1] text-[#14532D]">
                        <CheckCircle2 className="h-3 w-3" />
                        Succeeded
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E9EDF2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#171717] shadow-sm transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#7B8493]" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Record Operational Payment</h3>
                <p className="text-xs text-[#7B8493]">Link payment clearance to open customer invoice</p>
              </div>
              <button
                onClick={() => setIsRecordOpen(false)}
                className="p-2 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              {/* Invoice Selector */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                  Target Invoice (Customer & Balance) *
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  required
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                >
                  <option value="" disabled>Select Invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customerName} (Bal: {formatCurrency(inv.balanceDue)})
                    </option>
                  ))}
                </select>
              </div>

              {activeInvoice && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E9EDF2] text-xs space-y-1">
                  <div className="flex justify-between text-[#7B8493]">
                    <span>Invoice Total:</span>
                    <span className="font-semibold text-[#171717]">{formatCurrency(activeInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-[#7B8493]">
                    <span>Current Outstanding:</span>
                    <span className="font-bold text-rose-600">{formatCurrency(activeInvoice.balanceDue)}</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                >
                  <option value="BANK_TRANSFER">Bank Wire / ACH</option>
                  <option value="CARD">Credit Card</option>
                  <option value="UPI">UPI Merchant</option>
                  <option value="CASH">Cash / Cheque</option>
                </select>
              </div>

              {/* Transaction Reference & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Reference / Cheque # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WIRE-889124, UPI-9921"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Amount Received ($) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                  Staff Remarks
                </label>
                <input
                  type="text"
                  placeholder="Optional bank confirmation note"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EDF2]">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9EDF2] hover:bg-slate-50 text-xs font-semibold text-[#7B8493]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#171717]">Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="text-center py-3 bg-[#DDF0E1]/50 rounded-2xl border border-[#86EFAC]/40">
                <span className="text-xs text-[#14532D] font-medium block">Total Settled</span>
                <span className="text-2xl font-bold text-[#14532D] mt-0.5 block">
                  {formatCurrency(selectedPayment.amount)}
                </span>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full mt-1">
                  Cleared Transaction
                </span>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                <div className="flex justify-between">
                  <span className="text-[#7B8493]">Transaction Ref:</span>
                  <span className="font-mono font-bold text-[#171717]">{selectedPayment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B8493]">Customer:</span>
                  <span className="font-bold text-[#171717]">{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B8493]">Invoice Number:</span>
                  <span className="font-mono font-semibold text-[#171717]">{selectedPayment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B8493]">Payment Method:</span>
                  <span>{getMethodBadge(selectedPayment.method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B8493]">Payment Date:</span>
                  <span className="font-medium text-[#171717]">
                    {new Date(selectedPayment.paymentDate).toLocaleString()}
                  </span>
                </div>
                {selectedPayment.notes && (
                  <div className="pt-2 border-t border-[#E9EDF2]">
                    <span className="text-[#7B8493] block mb-0.5">Notes:</span>
                    <span className="text-[#171717] italic">{selectedPayment.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full py-2.5 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
