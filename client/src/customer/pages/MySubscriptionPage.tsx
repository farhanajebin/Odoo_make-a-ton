import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerButton } from '../components/common/CustomerButton';
import { CustomerBadge } from '../components/common/CustomerBadge';
import { CustomerModal } from '../components/common/CustomerModal';

export const MySubscriptionPage: React.FC = () => {
  const {
    subscription,
    profile,
    togglePauseResumeSubscription,
    requestRenewal,
    requestCancellation,
  } = useCustomerData();

  const navigate = useNavigate();

  // Modals for actions
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) return;
    requestCancellation(cancelReason);
    setIsCancelModalOpen(false);
    setCancelReason('');
  };

  const handleConfirmPauseResume = () => {
    togglePauseResumeSubscription();
    setIsPauseConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner / Status Overview Card */}
      <CustomerCard variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{subscription.productName}</h2>
                <CustomerBadge statusText={subscription.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Agreement #{subscription.subscriptionNumber} • Provisioned for {profile.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CustomerButton
              variant="outline"
              size="sm"
              icon={<ArrowUpRight className="w-4 h-4" />}
              onClick={() => navigate('/customer/plans')}
            >
              Change Tier
            </CustomerButton>

            {subscription.status === 'Active' ? (
              <CustomerButton
                variant="outline"
                size="sm"
                icon={<PauseCircle className="w-4 h-4 text-amber-600" />}
                onClick={() => setIsPauseConfirmOpen(true)}
              >
                Pause Agreement
              </CustomerButton>
            ) : subscription.status === 'Paused' ? (
              <CustomerButton
                variant="success"
                size="sm"
                icon={<PlayCircle className="w-4 h-4" />}
                onClick={() => setIsPauseConfirmOpen(true)}
              >
                Resume Agreement
              </CustomerButton>
            ) : (
              <CustomerButton
                variant="success"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={requestRenewal}
              >
                Renew Agreement
              </CustomerButton>
            )}
          </div>
        </div>

        {/* Primary Spec Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 font-medium uppercase text-[10px] block">
              Plan Model
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {subscription.planName}
            </span>
            <span className="text-[11px] text-slate-500">{subscription.frequency} billing cadence</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium uppercase text-[10px] block">
              Agreement Period
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {subscription.startDate}
            </span>
            <span className="text-[11px] text-slate-500">to {subscription.expiryDate}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium uppercase text-[10px] block">
              Payment Terms
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {subscription.paymentTerms}
            </span>
            <span className="text-[11px] text-slate-500">Auto-debit enabled</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium uppercase text-[10px] block">
              Recurring Amount
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(subscription.totalAmount)}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Billed every month</span>
          </div>
        </div>
      </CustomerCard>

      {/* Pricing Breakdown Card */}
      <CustomerCard variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Subscription Line Items & Billing Breakdown</span>
          <span className="text-xs font-normal text-slate-500">Values in Indian Rupees (INR)</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Item / Service Component</th>
                <th className="py-2.5 px-3 text-center">Quantity</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-3 text-right">Monthly Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900">
                    {subscription.productName} ({subscription.planName})
                  </div>
                  <div className="text-[11px] text-slate-500">Base software license entitlement</div>
                </td>
                <td className="py-3 px-3 text-center">{subscription.quantity}</td>
                <td className="py-3 px-3 text-right">{formatCurrency(subscription.basePrice)}</td>
                <td className="py-3 px-3 text-right font-semibold text-slate-900">
                  {formatCurrency(subscription.basePrice)}
                </td>
              </tr>

              {subscription.addons.filter((a) => a.isEnabled).map((a) => (
                <tr key={a.id}>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{a.name}</div>
                    <div className="text-[11px] text-slate-500">{a.description}</div>
                  </td>
                  <td className="py-3 px-3 text-center">1</td>
                  <td className="py-3 px-3 text-right">{formatCurrency(a.price)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">
                    {formatCurrency(a.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subtotal & Taxes calculation */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-72 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Base License:</span>
                <span>{formatCurrency(subscription.basePrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Add-ons:</span>
                <span>{formatCurrency(subscription.addonsTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subscription.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (18%):</span>
                <span>{formatCurrency(subscription.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Monthly Recurring Total:</span>
                <span>{formatCurrency(subscription.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </CustomerCard>

      {/* Customer Service Self-Service Controls */}
      <div className="p-5 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Subscription Lifecycle Actions</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Need to take a temporary break or cancel your agreement? Actions are processed at the end of your billing cycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subscription.status === 'Closed' ? (
            <CustomerButton
              variant="success"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={requestRenewal}
            >
              Renew Subscription
            </CustomerButton>
          ) : (
            <CustomerButton
              variant="danger"
              size="sm"
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => setIsCancelModalOpen(true)}
            >
              Request Cancellation
            </CustomerButton>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      <CustomerModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Request Subscription Cancellation"
        subtitle={`Agreement #${subscription.subscriptionNumber}`}
        maxWidth="md"
        footer={
          <>
            <CustomerButton
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep My Subscription
            </CustomerButton>
            <CustomerButton
              variant="danger"
              size="sm"
              disabled={!cancelReason.trim()}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </CustomerButton>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            We are sorry to see you go. If you submit this request, your subscription will remain active until the end of the current billing cycle on <strong className="text-slate-900">{subscription.expiryDate}</strong>, after which no further charges will occur.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Please share your reason for cancelling *
            </label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Scaling down team, transitioning to different workflow..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>
        </div>
      </CustomerModal>

      {/* Pause / Resume Modal */}
      <CustomerModal
        isOpen={isPauseConfirmOpen}
        onClose={() => setIsPauseConfirmOpen(false)}
        title={subscription.status === 'Active' ? 'Pause Subscription' : 'Resume Subscription'}
        subtitle="Temporary agreement hold"
        maxWidth="sm"
        footer={
          <>
            <CustomerButton
              variant="outline"
              size="sm"
              onClick={() => setIsPauseConfirmOpen(false)}
            >
              Cancel
            </CustomerButton>
            <CustomerButton
              variant="primary"
              size="sm"
              onClick={handleConfirmPauseResume}
            >
              {subscription.status === 'Active' ? 'Pause Agreement' : 'Resume Agreement'}
            </CustomerButton>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          {subscription.status === 'Active'
            ? 'Pausing your subscription places automated recurring invoicing on hold. Your access will remain available until the end of the current billing cycle.'
            : 'Resuming your subscription restores active recurring cycles and seamless service continuity.'}
        </p>
      </CustomerModal>
    </div>
  );
};
