import React, { useState } from 'react';
import {
  Search,
  Eye,
  FileDown,
  Printer,
  CreditCard,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerInvoice } from '../types';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerBadge } from '../components/common/CustomerBadge';
import { CustomerModal } from '../components/common/CustomerModal';

export const InvoicesPage: React.FC = () => {
  const { invoices, profile, downloadInvoicePDF, payInvoice } = useCustomerData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices by invoice number or product..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Draft">Draft</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredInvoices.length} statement(s) for {profile.company}
        </div>
      </div>

      {/* Invoices Table Card */}
      <CustomerCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-4">Billing Dates</th>
                <th className="py-3.5 px-4">Product / Entitlement</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">Taxes (18%)</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No billing statements match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-[10px]">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {inv.productName}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {formatCurrency(inv.taxTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <CustomerBadge statusText={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Invoice Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadInvoicePDF(inv.id)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Download / Print PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CustomerCard>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <CustomerModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Commercial Tax Invoice • Issued to ${profile.company}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <CustomerBadge statusText={selectedInvoice.status} />
              <div className="flex items-center gap-2">
                {selectedInvoice.balanceDue > 0 && selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => {
                      payInvoice(selectedInvoice.id);
                      setSelectedInvoice((prev) =>
                        prev ? { ...prev, status: 'Paid', amountPaid: prev.total, balanceDue: 0 } : null
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Pay Now ({formatCurrency(selectedInvoice.balanceDue)})
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Statement
                </button>
                <button
                  onClick={() => downloadInvoicePDF(selectedInvoice.id)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold hover:bg-teal-100 flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Close
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
                <p className="text-slate-500">support@brightloop.io</p>
              </div>
              <div className="text-right">
                <div className="text-slate-500">Issue Date: <strong className="text-slate-800">{selectedInvoice.issueDate}</strong></div>
                <div className="text-slate-500">Payment Due: <strong className="text-slate-800">{selectedInvoice.dueDate}</strong></div>
                <div className="text-slate-500">Terms: Net 15 Days</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Customer Account
                </span>
                <div className="font-bold text-slate-900">{profile.company}</div>
                <div className="text-slate-600">{profile.address}</div>
                <div className="text-slate-500 mt-0.5">GSTIN: {profile.gstin}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Settlement Status
                </span>
                <div>Amount Paid: <strong className="text-emerald-700">{formatCurrency(selectedInvoice.amountPaid)}</strong></div>
                <div>Balance Due: <strong className="text-slate-900">{formatCurrency(selectedInvoice.balanceDue)}</strong></div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
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
            </div>

            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1 text-right text-xs">
                <div className="text-slate-500">Subtotal: {formatCurrency(selectedInvoice.subtotal)}</div>
                <div className="text-slate-500">Discount: {formatCurrency(selectedInvoice.discount)}</div>
                <div className="text-slate-500">Taxes ({selectedInvoice.taxRate}% GST): {formatCurrency(selectedInvoice.taxTotal)}</div>
                <div className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  Total Amount: {formatCurrency(selectedInvoice.total)}
                </div>
              </div>
            </div>
          </div>
        </CustomerModal>
      )}
    </div>
  );
};
