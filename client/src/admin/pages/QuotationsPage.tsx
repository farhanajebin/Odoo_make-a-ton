import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  FileCheck,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { Quotation, QuotationLine } from '../types';
import { AdminCard } from '../components/common/AdminCard';
import { AdminButton } from '../components/common/AdminButton';
import { AdminBadge } from '../components/common/AdminBadge';
import { AdminModal } from '../components/common/AdminModal';
import { AdminConfirmDialog } from '../components/common/AdminConfirmDialog';

const TEMPLATES = [
  'Standard Enterprise Agreement',
  'Growth Tier Annual Quotation',
  'Volume Discount Custom SLA',
  'Pilot Proof of Concept (POC)',
];

export const QuotationsPage: React.FC = () => {
  const {
    quotations,
    customers,
    products,
    plans,
    addQuotation,
    convertQuotationToSubscription,
    deleteQuotation,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [templateName, setTemplateName] = useState(TEMPLATES[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lines, setLines] = useState<QuotationLine[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      planId: plans[0]?.id,
      planName: plans[0]?.name,
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 99,
      taxRate: 18,
      total: (products[0]?.sellingPrice || 99) * 1.18,
    },
  ]);

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...lines];
    const qty = updated[index].quantity;
    const price = prod.sellingPrice;
    const taxRate = updated[index].taxRate;
    const total = qty * price * (1 + taxRate / 100);

    updated[index] = {
      ...updated[index],
      productId,
      productName: prod.name,
      unitPrice: price,
      total: Math.round(total * 100) / 100,
    };
    setLines(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...lines];
    const item = updated[index];
    const validQty = Math.max(1, qty);
    const total = validQty * item.unitPrice * (1 + item.taxRate / 100);
    updated[index] = {
      ...item,
      quantity: validQty,
      total: Math.round(total * 100) / 100,
    };
    setLines(updated);
  };

  const addLine = () => {
    const defaultProd = products[0];
    const price = defaultProd?.sellingPrice || 100;
    setLines([
      ...lines,
      {
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        planId: plans[0]?.id,
        planName: plans[0]?.name,
        quantity: 1,
        unitPrice: price,
        taxRate: 18,
        total: Math.round(price * 1.18 * 100) / 100,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Subtotals
  const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  const taxTotal = lines.reduce(
    (acc, l) => acc + (l.quantity * l.unitPrice * l.taxRate) / 100,
    0
  );
  const grandTotal = subtotal + taxTotal;

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      templateName,
      validUntil,
      status: 'Sent',
      lines,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      total: Math.round(grandTotal * 100) / 100,
    });

    setIsCreateModalOpen(false);
  };

  const handleConvertToSubscription = (quoteId: string) => {
    const newSub = convertQuotationToSubscription(quoteId);
    if (newSub && viewingQuote?.id === quoteId) {
      setViewingQuote(null);
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Search & Create */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotations by quote # or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Converted">Converted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        <AdminButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Quotation
        </AdminButton>
      </div>

      {/* Quotations Table Card */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Quotation #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Template Model</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{q.quotationNumber}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {q.lines.length} product line(s)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{q.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{q.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {q.templateName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{q.validUntil}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${q.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge statusText={q.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingQuote(q)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Quotation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {q.status !== 'Converted' ? (
                        <button
                          onClick={() => handleConvertToSubscription(q.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                          title="Convert quotation to active subscription"
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Convert
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Converted</span>
                      )}

                      <button
                        onClick={() => setQuoteToDelete(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Quotation"
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

      {/* Create Quotation Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Commercial Quotation"
        subtitle="Select customer, template, and configure quotation lines with automatic taxes"
        maxWidth="xl"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleCreateQuotation}>
              Issue Quotation
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quotation Template
              </label>
              <select
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validity Expiration Date
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Product Lines Section */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quotation Line Items
              </span>
              <button
                type="button"
                onClick={addLine}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-100 text-xs"
                >
                  <div className="col-span-5">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                      Product
                    </label>
                    <select
                      value={line.productId}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.sellingPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      disabled
                      value={line.unitPrice}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-600 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                      Line Total
                    </label>
                    <div className="font-bold text-slate-900 py-1.5">
                      ${line.total.toLocaleString()}
                    </div>
                  </div>

                  <div className="col-span-1 text-right pt-4">
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations summary */}
            <div className="pt-3 border-t border-slate-200/80 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (18% GST / VAT):</span>
                  <span>${taxTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* View Quotation Modal */}
      {viewingQuote && (
        <AdminModal
          isOpen={!!viewingQuote}
          onClose={() => setViewingQuote(null)}
          title={`Quotation ${viewingQuote.quotationNumber}`}
          subtitle={`Issued to ${viewingQuote.customerName} (${viewingQuote.customerEmail})`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <AdminBadge statusText={viewingQuote.status} />
              <div className="flex items-center gap-2">
                {viewingQuote.status !== 'Converted' && (
                  <AdminButton
                    variant="success"
                    size="sm"
                    icon={<FileCheck className="w-4 h-4" />}
                    onClick={() => handleConvertToSubscription(viewingQuote.id)}
                  >
                    Convert into Subscription
                  </AdminButton>
                )}
                <AdminButton variant="outline" size="sm" onClick={() => setViewingQuote(null)}>
                  Close
                </AdminButton>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Customer & Template
                </span>
                <div className="font-semibold text-slate-900">{viewingQuote.customerName}</div>
                <div className="text-slate-500">{viewingQuote.customerEmail}</div>
                <div className="text-slate-600 mt-1">Template: {viewingQuote.templateName}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Validity & Status
                </span>
                <div>Valid Until: <span className="font-semibold text-slate-800">{viewingQuote.validUntil}</span></div>
                <div>Status: <span className="font-semibold text-slate-800">{viewingQuote.status}</span></div>
                {viewingQuote.convertedSubscriptionId && (
                  <div className="text-emerald-700 font-semibold mt-1">
                    Linked Subscription: #{viewingQuote.convertedSubscriptionId}
                  </div>
                )}
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="p-3">Product Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Tax Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingQuote.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-slate-900">{l.productName}</td>
                      <td className="p-3 text-center">{l.quantity}</td>
                      <td className="p-3 text-right">${l.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right">{l.taxRate}%</td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        ${l.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pr-2">
              <div className="w-56 space-y-1 text-right">
                <div className="text-slate-500">Subtotal: ${viewingQuote.subtotal.toLocaleString()}</div>
                <div className="text-slate-500">Tax Total: ${viewingQuote.taxTotal.toLocaleString()}</div>
                <div className="text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                  Total: ${viewingQuote.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!quoteToDelete}
        onClose={() => setQuoteToDelete(null)}
        onConfirm={() => {
          if (quoteToDelete) {
            deleteQuotation(quoteToDelete.id);
            setQuoteToDelete(null);
          }
        }}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${quoteToDelete?.quotationNumber}?`}
        confirmText="Delete Quotation"
        type="danger"
      />
    </div>
  );
};
