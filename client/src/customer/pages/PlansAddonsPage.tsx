import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerButton } from '../components/common/CustomerButton';
import { CustomerModal } from '../components/common/CustomerModal';

export const PlansAddonsPage: React.FC = () => {
  const { plans, addons, subscription, changePlan, toggleAddon } = useCustomerData();

  const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const planToConfirm = plans.find((p) => p.id === confirmPlanId);

  const handleConfirmPlanChange = () => {
    if (confirmPlanId) {
      changePlan(confirmPlanId);
      setConfirmPlanId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* SECTION 1: AVAILABLE SUBSCRIPTION PLANS */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Subscription Plans</h2>
          <p className="text-xs text-slate-500">
            Choose the subscription tier that best matches your organization's operational scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => {
            const isCurrent = p.isCurrent;

            return (
              <div
                key={p.id}
                className={`
                  rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between
                  ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-teal-400 ring-offset-2'
                      : 'bg-white text-slate-900 border-slate-200 shadow-sm hover:border-slate-300'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-teal-300' : 'text-slate-500'
                      }`}
                    >
                      {p.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold tracking-tight">
                      {formatCurrency(p.price)}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      /{p.frequency.toLowerCase()}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-2 leading-relaxed ${
                      isCurrent ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {p.description}
                  </p>

                  <div className={`h-px my-4 ${isCurrent ? 'bg-slate-800' : 'bg-slate-100'}`} />

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isCurrent ? 'text-teal-400' : 'text-emerald-600'
                          }`}
                        />
                        <span className={isCurrent ? 'text-slate-200' : 'text-slate-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 text-teal-300 text-xs font-semibold border border-slate-700 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400" /> Active Plan
                    </button>
                  ) : (
                    <CustomerButton
                      variant={p.recommended ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setConfirmPlanId(p.id)}
                    >
                      {p.price > subscription.basePrice ? 'Upgrade to Tier' : 'Downgrade to Tier'}
                    </CustomerButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MODULAR ADD-ONS */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Modular Feature Add-ons</h2>
          <p className="text-xs text-slate-500">
            Enable optional add-ons as needed. Pricing updates dynamically and applies to your next billing cycle.
          </p>
        </div>

        <div className="space-y-3">
          {addons.map((a) => {
            const isEnabled = a.isEnabled;

            return (
              <div
                key={a.id}
                className={`
                  p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                  ${
                    isEnabled
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }
                `}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{a.name}</h4>
                      {isEnabled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Add-on
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 block">
                      +{formatCurrency(a.price)}
                    </span>
                    <span className="text-[10px] text-slate-400">per month</span>
                  </div>

                  <button
                    onClick={() => toggleAddon(a.id)}
                    className="focus:outline-none transition-transform active:scale-95"
                    title={isEnabled ? 'Disable Add-on' : 'Enable Add-on'}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: REAL-TIME RECALCULATED BILLING ESTIMATE */}
      <CustomerCard variant="sky" padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">
              Updated Billing Projection (Next Cycle)
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(subscription.totalAmount)} / month
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Includes base plan {subscription.planName} ({formatCurrency(subscription.basePrice)}) + active add-ons ({formatCurrency(subscription.addonsTotal)}) + 18% GST ({formatCurrency(subscription.taxAmount)})
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/80 border border-blue-200 text-xs text-slate-700 space-y-1">
            <div><span className="font-semibold">Next Invoice Date:</span> {subscription.nextBillingDate}</div>
            <div className="text-[11px] text-slate-500">Charges are never applied silently or without prior invoice.</div>
          </div>
        </div>
      </CustomerCard>

      {/* Plan Switch Confirmation Dialog */}
      {planToConfirm && (
        <CustomerModal
          isOpen={!!planToConfirm}
          onClose={() => setConfirmPlanId(null)}
          title={`Switch to ${planToConfirm.name}?`}
          subtitle={`Rate adjustment to ${formatCurrency(planToConfirm.price)}/month`}
          maxWidth="sm"
          footer={
            <>
              <CustomerButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmPlanId(null)}
              >
                Cancel
              </CustomerButton>
              <CustomerButton
                variant="primary"
                size="sm"
                onClick={handleConfirmPlanChange}
              >
                Confirm Plan Switch
              </CustomerButton>
            </>
          }
        >
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              You are about to switch your active subscription tier to <strong className="text-slate-900">{planToConfirm.name}</strong>.
            </p>
            <p>
              This change will update your entitlements immediately and will be reflected on your next billing date of <strong className="text-slate-900">{subscription.nextBillingDate}</strong>.
            </p>
          </div>
        </CustomerModal>
      )}
    </div>
  );
};
