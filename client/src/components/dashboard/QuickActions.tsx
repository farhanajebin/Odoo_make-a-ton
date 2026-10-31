import React, { useState } from 'react';
import { UserPlus, PackagePlus, Layers, FileSpreadsheet, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export const QuickActions: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actionConfigs: Record<
    string,
    { title: string; subtitle: string; milestone: string; description: string; plannedFields: string[] }
  > = {
    customer: {
      title: 'Customer Onboarding Pipeline',
      subtitle: 'Target: Milestone COMMIT 03 — Customer Intelligence',
      milestone: 'Commit 03',
      description:
        'The Customer entity is fully modeled in Prisma with legal entities, multi-currency credit lines, parent-child hierarchies and billing contacts.',
      plannedFields: [
        'Legal Entity Name & Trading Name',
        'Tax ID & Exemption Verification',
        'Multi-Currency Wallet Defaults',
        'Billing Address & Automated Invoicing Contact',
      ],
    },
    product: {
      title: 'Product Catalog Architect',
      subtitle: 'Target: Milestone COMMIT 04 — Product Catalog & Pricing Engine',
      milestone: 'Commit 04',
      description:
        'The Product & ProductVariant models are configured to support recurring services, one-time fees, and metered usage units.',
      plannedFields: [
        'Product Code (SKU)',
        'Product Classification (Recurring, Add-on, Usage-metered)',
        'Tax Categorization',
        'Variant Pricing Matrices',
      ],
    },
    plan: {
      title: 'Subscription Tier Formulation',
      subtitle: 'Target: Milestone COMMIT 04 — Product Catalog & Pricing Engine',
      milestone: 'Commit 04',
      description:
        'SubscriptionPlan model supports monthly, quarterly, semi-annual and annual cadences, trial periods, and currency-specific pricing tiers.',
      plannedFields: [
        'Billing Cadence (Monthly, Annual, Custom)',
        'Base Price (Decimal Precision)',
        'Trial Period Duration (Days)',
        'Renewal Grace Period & Dunning Policy',
      ],
    },
    quotation: {
      title: 'B2B Quotation Builder',
      subtitle: 'Target: Milestone COMMIT 05 — Quotation & Contract Generator',
      milestone: 'Commit 05',
      description:
        'Quotation, QuotationLine, and QuotationTemplate models will power CPQ (Configure, Price, Quote) workflows with approval matrices.',
      plannedFields: [
        'Customer Account Selector',
        'Quotation Line Items & Tier Discounts',
        'Executive Approval Gateways',
        'One-Click Conversion to Active Subscription',
      ],
    },
  };

  const currentConfig = activeModal ? actionConfigs[activeModal] : null;

  return (
    <>
      <Card className="col-span-full xl:col-span-4">
        <CardHeader>
          <div>
            <CardTitle>Rapid Operations</CardTitle>
            <CardDescription>Primary revenue operation workflows</CardDescription>
          </div>
          <Badge variant="teal" size="sm">
            Ready
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveModal('customer')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:border-loopnex-electricTeal/50 transition-all text-left group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-loopnex-electricTeal/15 dark:text-loopnex-electricTeal mb-2 group-hover:scale-105 transition-transform">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                Add Customer
              </span>
              <span className="text-[10px] text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
                New business account
              </span>
            </button>

            <button
              onClick={() => setActiveModal('product')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:border-loopnex-softCyan/50 transition-all text-left group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 dark:bg-loopnex-softCyan/15 dark:text-loopnex-softCyan mb-2 group-hover:scale-105 transition-transform">
                <PackagePlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                Create Product
              </span>
              <span className="text-[10px] text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
                Catalog item & SKUs
              </span>
            </button>

            <button
              onClick={() => setActiveModal('plan')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:border-loopnex-violetAccent/50 transition-all text-left group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:bg-loopnex-violetAccent/20 dark:text-loopnex-violetAccent mb-2 group-hover:scale-105 transition-transform">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                Create Plan
              </span>
              <span className="text-[10px] text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
                Billing cadence & pricing
              </span>
            </button>

            <button
              onClick={() => setActiveModal('quotation')}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50/50 dark:bg-loopnex-surface/40 hover:bg-slate-100 dark:hover:bg-loopnex-surface hover:border-amber-400/50 transition-all text-left group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                Create Quotation
              </span>
              <span className="text-[10px] text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
                B2B proposal builder
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog for Planned Operations */}
      {currentConfig && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-loopnex-surfaceBorder bg-slate-50 dark:bg-loopnex-surface/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-loopnex-electricTeal" />
                <span className="text-xs font-semibold text-slate-900 dark:text-loopnex-primaryText">
                  Architectural Blueprint Status
                </span>
                <Badge variant="teal" size="sm">
                  {currentConfig.milestone}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-loopnex-secondaryText leading-relaxed">
                {currentConfig.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Planned Schema Attributes
              </h4>
              <ul className="space-y-2">
                {currentConfig.plannedFields.map((field, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-700 dark:text-loopnex-primaryText"
                  >
                    <ArrowRight className="h-3 w-3 text-loopnex-electricTeal" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
