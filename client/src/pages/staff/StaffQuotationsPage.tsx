import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Printer,
  CheckCircle2,
  Send,
  X,
} from 'lucide-react';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { QuotationItem, CustomerItem } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffQuotationsPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();

  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [productName, setProductName] = useState('LoopNex Enterprise Engine');
  const [productVariant, setProductVariant] = useState('Dedicated Cloud HA');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(4800);
  const [taxRate, setTaxRate] = useState(8.25);
  const [discount, setDiscount] = useState(0);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('Payment terms: Net 30 upon digital sign-off.');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Preview / Print Modal
  const [previewQuote, setPreviewQuote] = useState<QuotationItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotesData, customersData] = await Promise.all([
        staffApi.getQuotations({ search: searchQuery, status: statusFilter }),
        staffApi.getCustomers(),
      ]);
      setQuotations(quotesData);
      setCustomers(customersData);
      if (customersData.length > 0 && !selectedCustomer) {
        setSelectedCustomer(customersData[0].id);
      }
    } catch (err) {
      console.error('Failed to load quotations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  // Real-time calculated amounts for creation form
  const formSubtotal = quantity * unitPrice;
  const formTaxable = Math.max(0, formSubtotal - discount);
  const formTax = Number(((formTaxable * taxRate) / 100).toFixed(2));
  const formTotal = Number((formTaxable + formTax).toFixed(2));

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomer) {
      setFormError('Please select a customer.');
      return;
    }
    if (quantity < 1) {
      setFormError('Quantity must be at least 1.');
      return;
    }
    if (unitPrice < 0) {
      setFormError('Unit price cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);
      await staffApi.createQuotation({
        customerId: selectedCustomer,
        product: productName,
        variant: productVariant,
        quantity,
        unitPrice,
        taxRate,
        discount,
        validDays,
        notes,
      });
      setIsCreateOpen(false);
      // Reset form
      setQuantity(1);
      setUnitPrice(4800);
      setDiscount(0);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to create quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await staffApi.updateQuotationStatus(id, newStatus);
      loadData();
      if (previewQuote && previewQuote.id === id) {
        setPreviewQuote({ ...previewQuote, status: newStatus as any });
      }
    } catch (err) {
      console.error('Failed to update quote status', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-[#7B8493]">
            Draft
          </span>
        );
      case 'SENT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F0FC] text-[#1E3A8A]">
            Sent
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDF0E1] text-[#14532D]">
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
            Rejected
          </span>
        );
      case 'EXPIRED':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5EFD8] text-[#713F12]">
            Expired
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

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Quotations & CPQ"
        subtitle="Generate customized recurring quotations, proposal drafts, and contract conversion"
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search quotations by quote ID, customer, or product..."
      />

      {/* Control & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#7B8493]">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Quotations Table */}
      <div className="rounded-3xl border border-[#E9EDF2] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9EDF2] bg-slate-50/75 text-[11px] font-bold text-[#7B8493] uppercase tracking-wider">
                <th className="py-3.5 px-4">Quote ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Product / Variant</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4 text-right">Unit Price</th>
                <th className="py-3.5 px-4 text-right">Tax</th>
                <th className="py-3.5 px-4 text-right">Discount</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDF2] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#7B8493]">
                    Loading quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#7B8493]">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#171717]">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      {q.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      <span className="font-medium text-[#171717] block">{q.product}</span>
                      <span className="text-[11px]">{q.variant}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-[#171717]">
                      {q.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#7B8493]">
                      {formatCurrency(q.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#7B8493]">
                      {formatCurrency(q.taxTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#7B8493]">
                      {q.discount > 0 ? `-${formatCurrency(q.discount)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#171717]">
                      {formatCurrency(q.total)}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      {new Date(q.validUntil).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(q.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewQuote(q)}
                          title="Preview & Print"
                          className="p-1.5 rounded-xl border border-[#E9EDF2] hover:bg-slate-50 text-[#171717]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {q.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusChange(q.id, 'SENT')}
                            title="Dispatch Quote to Client"
                            className="p-1.5 rounded-xl bg-[#E2F0FC] hover:bg-[#A9D4F5] text-[#1E3A8A]"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {q.status === 'SENT' && (
                          <button
                            onClick={() => handleStatusChange(q.id, 'ACCEPTED')}
                            title="Mark Accepted"
                            className="p-1.5 rounded-xl bg-[#DDF0E1] hover:bg-emerald-200 text-[#14532D]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
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

      {/* Create Quotation Modal Form */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">New Quotation</h3>
                <p className="text-xs text-[#7B8493]">Configure CPQ line items, taxes, and validity</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              {/* Customer Selector */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                  Customer Account *
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  required
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                >
                  <option value="" disabled>Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legalName} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product and Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Product *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Variant / Plan SKU
                  </label>
                  <input
                    type="text"
                    value={productVariant}
                    onChange={(e) => setProductVariant(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
              </div>

              {/* Pricing, Quantity, Tax, Discount */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="p-4 rounded-2xl bg-[#E2F0FC]/60 border border-[#A9D4F5]/40 space-y-2">
                <div className="flex justify-between text-xs text-[#1E3A8A]">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(formSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-[#1E3A8A]">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#1E3A8A]">
                  <span>Estimated Tax ({taxRate}%):</span>
                  <span className="font-semibold">{formatCurrency(formTax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#171717] pt-2 border-t border-[#A9D4F5]/40">
                  <span>Total Proposed:</span>
                  <span>{formatCurrency(formTotal)}</span>
                </div>
              </div>

              {/* Validity and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value, 10) || 30)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                    Terms / Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EDF2]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9EDF2] hover:bg-slate-50 text-xs font-semibold text-[#7B8493]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#171717] text-white hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Generate Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Preview & Printable Dialog */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Quotation Preview</h3>
                <p className="text-xs text-[#7B8493]">{previewQuote.quoteNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9EDF2] text-xs font-semibold text-[#171717] hover:bg-slate-50 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPreviewQuote(null)}
                  className="p-2 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Letterhead Content */}
            <div className="p-6 rounded-2xl border border-[#E9EDF2] bg-white space-y-6 print:border-none print:p-0">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between pb-6 border-b border-[#E9EDF2]">
                <div>
                  <h4 className="text-base font-extrabold text-[#171717]">BRIGHTLOOP SOFTWARE</h4>
                  <p className="text-xs text-[#7B8493]">Subscription Management Operations</p>
                  <p className="text-[11px] text-[#7B8493] mt-1">100 Enterprise Way, Suite 400</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#171717] block">
                    {previewQuote.quoteNumber}
                  </span>
                  <div className="mt-1">{getStatusBadge(previewQuote.status)}</div>
                  <p className="text-[11px] text-[#7B8493] mt-1">
                    Date: {new Date(previewQuote.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer Box */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-[#7B8493] block">Prepared For:</span>
                  <span className="font-bold text-[#171717] block mt-0.5">{previewQuote.customerName}</span>
                  <span className="text-[#7B8493] block">{previewQuote.customerEmail}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-[#7B8493] block">Valid Through:</span>
                  <span className="font-bold text-[#171717] block mt-0.5">
                    {new Date(previewQuote.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E9EDF2] text-[11px] font-semibold text-[#7B8493]">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2]">
                  <tr>
                    <td className="py-3">
                      <span className="font-bold text-[#171717] block">{previewQuote.product}</span>
                      <span className="text-[11px] text-[#7B8493]">{previewQuote.variant}</span>
                    </td>
                    <td className="py-3 text-center">{previewQuote.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(previewQuote.unitPrice)}</td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(previewQuote.subtotal)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Financial Totals */}
              <div className="flex justify-end pt-4 border-t border-[#E9EDF2]">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#7B8493]">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-[#171717]">{formatCurrency(previewQuote.subtotal)}</span>
                  </div>
                  {previewQuote.discount > 0 && (
                    <div className="flex justify-between text-[#7B8493]">
                      <span>Discount:</span>
                      <span className="font-semibold text-[#171717]">-{formatCurrency(previewQuote.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#7B8493]">
                    <span>Tax ({previewQuote.taxRate}%):</span>
                    <span className="font-semibold text-[#171717]">{formatCurrency(previewQuote.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#171717] pt-2 border-t border-[#E9EDF2]">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(previewQuote.total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms / Notes */}
              {previewQuote.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-[#E9EDF2] text-[11px] text-[#7B8493]">
                  <span className="font-bold text-[#171717] block mb-0.5">Terms & Conditions:</span>
                  {previewQuote.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
