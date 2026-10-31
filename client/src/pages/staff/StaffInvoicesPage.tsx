import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Printer,
  X,
  CreditCard,
} from 'lucide-react';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { InvoiceItem, PaymentItem } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffInvoicesPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Preview & Print Modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, payData] = await Promise.all([
        staffApi.getInvoices({ search: searchQuery, status: statusFilter }),
        staffApi.getPayments(),
      ]);
      setInvoices(invData);
      setPayments(payData);
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  const handleConfirmInvoice = async (id: string) => {
    try {
      const updated = await staffApi.confirmInvoice(id);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updated);
      }
    } catch (err) {
      console.error('Failed to confirm invoice', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDF0E1] text-[#14532D]">
            Paid
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F0FC] text-[#1E3A8A]">
            Partially Paid
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EAE3F4] text-[#581C87]">
            Confirmed
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
            Overdue
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-[#7B8493]">
            Cancelled
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5EFD8] text-[#713F12]">
            Draft
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentsForInvoice = (invoiceId: string) => {
    return payments.filter((p) => p.invoiceId === invoiceId);
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Billing & Invoices"
        subtitle="Track subscription billing dispatches, payment balances, and collection integrity"
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoices by invoice number, customer, or sub number..."
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#7B8493]">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-[#7B8493]">
          Showing {invoices.length} invoices
        </span>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl border border-[#E9EDF2] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9EDF2] bg-slate-50/75 text-[11px] font-bold text-[#7B8493] uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Sub ID</th>
                <th className="py-3.5 px-4">Issued Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDF2] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#7B8493]">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#7B8493]">
                    No invoices matching your selection.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#171717]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      {inv.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493] font-mono">
                      {inv.subNumber || 'Ad-hoc'}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#171717]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {formatCurrency(inv.balanceDue)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="View & Print"
                          className="p-1.5 rounded-xl border border-[#E9EDF2] hover:bg-slate-50 text-[#171717]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => handleConfirmInvoice(inv.id)}
                            title="Confirm Draft Invoice"
                            className="px-2.5 py-1 rounded-xl bg-[#E2F0FC] hover:bg-[#A9D4F5] text-[11px] font-semibold text-[#1E3A8A]"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice View / Print / PDF Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Invoice Statement</h3>
                <p className="text-xs text-[#7B8493]">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9EDF2] text-xs font-semibold text-[#171717] hover:bg-slate-50 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Statement</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-6 rounded-2xl border border-[#E9EDF2] bg-white space-y-6 print:border-none print:p-0">
              <div className="flex items-start justify-between pb-6 border-b border-[#E9EDF2]">
                <div>
                  <h4 className="text-base font-extrabold text-[#171717]">BRIGHTLOOP SOFTWARE</h4>
                  <p className="text-xs text-[#7B8493]">Tax ID: US-EIN-984210492</p>
                  <p className="text-[11px] text-[#7B8493]">100 Enterprise Way, Suite 400</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#171717] block">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                  <p className="text-[11px] text-[#7B8493] mt-1">
                    Issued: {new Date(selectedInvoice.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] font-semibold text-rose-600">
                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billed to */}
              <div className="text-xs">
                <span className="text-[11px] font-semibold text-[#7B8493] block">Billed To:</span>
                <span className="font-bold text-[#171717] block mt-0.5">{selectedInvoice.customerName}</span>
                <span className="text-[#7B8493] block">{selectedInvoice.customerEmail}</span>
                {selectedInvoice.subNumber && (
                  <span className="text-[11px] text-[#7B8493] block mt-1">
                    Subscription Reference: {selectedInvoice.subNumber}
                  </span>
                )}
              </div>

              {/* Line items */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E9EDF2] text-[11px] font-semibold text-[#7B8493]">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2]">
                  {selectedInvoice.lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium text-[#171717]">{line.description}</td>
                      <td className="py-3 text-center">{line.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(line.unitPrice)}</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(line.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-[#E9EDF2]">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#7B8493]">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-[#171717]">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#7B8493]">
                    <span>Tax:</span>
                    <span className="font-semibold text-[#171717]">{formatCurrency(selectedInvoice.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#171717] pt-2 border-t border-[#E9EDF2]">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-600">
                    <span>Paid to Date:</span>
                    <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-rose-600 pt-1 border-t border-dashed border-[#E9EDF2]">
                    <span>Outstanding Balance:</span>
                    <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Records Section */}
              <div className="pt-4 border-t border-[#E9EDF2] space-y-2">
                <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider text-[#7B8493]">
                  Associated Payments ({getPaymentsForInvoice(selectedInvoice.id).length})
                </h5>
                {getPaymentsForInvoice(selectedInvoice.id).length === 0 ? (
                  <p className="text-xs text-[#7B8493]">No payment transactions recorded for this invoice yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {getPaymentsForInvoice(selectedInvoice.id).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[#E9EDF2] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-[#1E3A8A]" />
                          <span className="font-mono font-semibold text-[#171717]">{p.reference}</span>
                          <span className="text-[10px] text-[#7B8493]">({p.method})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600 block">{formatCurrency(p.amount)}</span>
                          <span className="text-[10px] text-[#7B8493]">
                            {new Date(p.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
