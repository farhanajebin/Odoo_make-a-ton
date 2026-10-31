import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Mail,
  CheckCircle2,
  Clock,
  X,
  Repeat,
  FileText,
} from 'lucide-react';
import { StaffHeader } from '../../components/layout/StaffHeader';
import { staffApi } from '../../services/api';
import { CustomerItem, SubscriptionItem, InvoiceItem } from '../../types';

interface OutletContextType {
  onToggleMobileMenu: () => void;
}

export const StaffCustomersPage: React.FC = () => {
  const { onToggleMobileMenu } = useOutletContext<OutletContextType>();

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Customer Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<{
    customer: CustomerItem;
    subscriptions: SubscriptionItem[];
    invoices: InvoiceItem[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getCustomers({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
      });
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery, statusFilter, typeFilter]);

  const handleViewCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    try {
      setDetailLoading(true);
      const data = await staffApi.getCustomerDetails(id);
      setCustomerDetails(data);
    } catch (err) {
      console.error('Failed to load customer details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDF0E1] text-[#14532D]">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5EFD8] text-[#713F12]">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'INACTIVE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-[#7B8493]">
            Inactive
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ENTERPRISE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EAE3F4] text-[#581C87]">
            Enterprise
          </span>
        );
      case 'MID_MARKET':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E2F0FC] text-[#1E3A8A]">
            Mid-Market
          </span>
        );
      case 'STARTUP':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-[#171717]">
            Startup
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        title="Assigned Customers"
        subtitle="Manage assigned corporate accounts, subscriptions, and billing health"
        onToggleMobileMenu={onToggleMobileMenu}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by customer name, email, company, or phone..."
      />

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7B8493]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7B8493]">Account Tier:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-medium py-1.5 px-3 rounded-xl bg-white border border-[#E9EDF2] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5]"
            >
              <option value="ALL">All Tiers</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="MID_MARKET">Mid-Market</option>
              <option value="STARTUP">Startup</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#7B8493]">
          Showing {customers.length} accounts
        </div>
      </div>

      {/* Customer Listing Table */}
      <div className="rounded-3xl border border-[#E9EDF2] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9EDF2] bg-slate-50/75 text-[11px] font-bold text-[#7B8493] uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Contact Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Account Type</th>
                <th className="py-3.5 px-4 text-center">Active Subs</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDF2] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7B8493]">
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7B8493]">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      {c.legalName}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493] font-medium">
                      {c.company}
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#7B8493]" />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#7B8493]">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getTypeBadge(c.customerType)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#171717]">
                      {c.activeSubscriptions}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E9EDF2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#171717] shadow-sm transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#7B8493]" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E9EDF2] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF2]">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">
                  {customerDetails?.customer.legalName || 'Customer Profile'}
                </h3>
                <p className="text-xs text-[#7B8493]">Account Operational Overview</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setCustomerDetails(null);
                }}
                className="p-2 rounded-xl text-[#7B8493] hover:text-[#171717] hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-[#7B8493] text-sm">
                Retrieving customer details...
              </div>
            ) : customerDetails ? (
              <div className="space-y-6">
                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-[#E9EDF2]">
                  <div>
                    <span className="text-[11px] font-semibold text-[#7B8493] block">Trading Name</span>
                    <span className="text-xs font-bold text-[#171717]">
                      {customerDetails.customer.tradingName || customerDetails.customer.legalName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#7B8493] block">Account Status</span>
                    <div className="mt-0.5">{getStatusBadge(customerDetails.customer.status)}</div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#7B8493] block">Email</span>
                    <span className="text-xs font-medium text-[#171717]">{customerDetails.customer.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#7B8493] block">Phone</span>
                    <span className="text-xs font-medium text-[#171717]">{customerDetails.customer.phone || '—'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-semibold text-[#7B8493] block">Billing Address</span>
                    <span className="text-xs font-medium text-[#171717]">
                      {customerDetails.customer.address || 'Standard Corporate HQ'}
                    </span>
                  </div>
                </div>

                {/* Subscriptions section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-[#3B82F6]" />
                      <span>Associated Subscriptions ({customerDetails.subscriptions.length})</span>
                    </h4>
                  </div>
                  {customerDetails.subscriptions.length === 0 ? (
                    <p className="text-xs text-[#7B8493]">No active subscriptions found for this account.</p>
                  ) : (
                    <div className="space-y-2">
                      {customerDetails.subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#E9EDF2] bg-white text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#171717] block">{sub.plan}</span>
                            <span className="text-[11px] text-[#7B8493]">{sub.subNumber} • {sub.cadence}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#171717] block">
                              ${sub.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-[#DDF0E1] px-2 py-0.5 rounded-full">
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invoices section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#6366F1]" />
                      <span>Billing Invoices ({customerDetails.invoices.length})</span>
                    </h4>
                  </div>
                  {customerDetails.invoices.length === 0 ? (
                    <p className="text-xs text-[#7B8493]">No invoice history recorded for this customer.</p>
                  ) : (
                    <div className="space-y-2">
                      {customerDetails.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#E9EDF2] bg-white text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#171717] block">{inv.invoiceNumber}</span>
                            <span className="text-[11px] text-[#7B8493]">
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#171717] block">
                              Total: ${inv.total.toLocaleString()}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                inv.status === 'PAID'
                                  ? 'bg-[#DDF0E1] text-emerald-700'
                                  : inv.status === 'OVERDUE'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-[#F5EFD8] text-amber-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
