import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Customer,
  Product,
  ProductVariant,
  Plan,
  Quotation,
  Subscription,
  Invoice,
  Discount,
  Payment,
  Staff,
  TaxRule,
  CompanySettings,
} from '../types';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AdminDataContextType {
  // State
  customers: Customer[];
  products: Product[];
  variants: ProductVariant[];
  plans: Plan[];
  quotations: Quotation[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  discounts: Discount[];
  payments: Payment[];
  staff: Staff[];
  taxes: TaxRule[];
  settings: CompanySettings;
  toasts: ToastMessage[];

  // Toast actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Customers
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'balance' | 'activeSubscriptionsCount' | 'totalInvoiced'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Products
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'variantsCount'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Variants
  addVariant: (data: Omit<ProductVariant, 'id' | 'createdAt'>) => void;
  updateVariant: (id: string, data: Partial<ProductVariant>) => void;
  deleteVariant: (id: string) => void;

  // Plans
  addPlan: (data: Omit<Plan, 'id' | 'createdAt' | 'subscribersCount'>) => void;
  updatePlan: (id: string, data: Partial<Plan>) => void;
  deletePlan: (id: string) => void;

  // Quotations
  addQuotation: (data: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => Quotation;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  convertQuotationToSubscription: (id: string) => Subscription | null;
  deleteQuotation: (id: string) => void;

  // Subscriptions
  addSubscription: (data: Omit<Subscription, 'id' | 'subscriptionNumber' | 'createdAt'>) => void;
  updateSubscription: (id: string, data: Partial<Subscription>) => void;
  updateSubscriptionStatus: (id: string, status: Subscription['status']) => void;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  renewSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;

  // Invoices
  addInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  confirmInvoice: (id: string) => void;
  cancelInvoice: (id: string) => void;
  markInvoicePaid: (id: string, method?: string) => void;
  deleteInvoice: (id: string) => void;

  // Discounts
  addDiscount: (data: Omit<Discount, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateDiscount: (id: string, data: Partial<Discount>) => void;
  toggleDiscountStatus: (id: string) => void;
  deleteDiscount: (id: string) => void;

  // Payments
  addPayment: (data: Omit<Payment, 'id' | 'referenceNumber' | 'createdAt'>) => void;
  deletePayment: (id: string) => void;

  // Staff
  addStaff: (data: Omit<Staff, 'id' | 'createdAt' | 'lastActive'>) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  toggleStaffStatus: (id: string) => void;
  deleteStaff: (id: string) => void;

  // Taxes
  addTax: (data: Omit<TaxRule, 'id' | 'createdAt'>) => void;
  updateTax: (id: string, data: Partial<TaxRule>) => void;
  toggleTaxStatus: (id: string) => void;
  deleteTax: (id: string) => void;

  // Settings
  updateSettings: (data: Partial<CompanySettings>) => void;
  resetToDefaults: () => void;
}

// -----------------------------------------------------------------------------
// Realistic Seed Data
// -----------------------------------------------------------------------------
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Acme Global Technologies',
    email: 'billing@acmeglobal.io',
    phone: '+1 (555) 019-2834',
    company: 'Acme Global Inc.',
    status: 'Active',
    currency: 'USD',
    balance: 0,
    activeSubscriptionsCount: 2,
    totalInvoiced: 24500,
    createdAt: '2025-11-12',
  },
  {
    id: 'cust-2',
    name: 'Synthetix Dynamics Corp',
    email: 'finance@synthetix.com',
    phone: '+1 (555) 014-9921',
    company: 'Synthetix Corp',
    status: 'Active',
    currency: 'USD',
    balance: 1450,
    activeSubscriptionsCount: 1,
    totalInvoiced: 18200,
    createdAt: '2025-12-05',
  },
  {
    id: 'cust-3',
    name: 'Vanguard Biometrics',
    email: 'accounts@vanguardbio.org',
    phone: '+1 (555) 082-1133',
    company: 'Vanguard Health Labs',
    status: 'Active',
    currency: 'USD',
    balance: 0,
    activeSubscriptionsCount: 1,
    totalInvoiced: 32000,
    createdAt: '2026-01-10',
  },
  {
    id: 'cust-4',
    name: 'Oasis Cloud Infrastructure',
    email: 'ops@oasiscloud.net',
    phone: '+1 (555) 039-4455',
    company: 'Oasis Networks',
    status: 'Delinquent',
    currency: 'USD',
    balance: 4210,
    activeSubscriptionsCount: 1,
    totalInvoiced: 12630,
    createdAt: '2026-01-22',
  },
  {
    id: 'cust-5',
    name: 'Hyperion Robotics Ltd',
    email: 'contact@hyperion.tech',
    phone: '+44 20 7946 0991',
    company: 'Hyperion AI Labs',
    status: 'Lead',
    currency: 'USD',
    balance: 0,
    activeSubscriptionsCount: 0,
    totalInvoiced: 0,
    createdAt: '2026-02-14',
  },
  {
    id: 'cust-6',
    name: 'Nexus FinTech Systems',
    email: 'accounting@nexusfin.io',
    phone: '+1 (555) 091-8822',
    company: 'Nexus Capital Partners',
    status: 'Inactive',
    currency: 'USD',
    balance: 0,
    activeSubscriptionsCount: 0,
    totalInvoiced: 8900,
    createdAt: '2025-09-30',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'LOOPNEX RevOps Platform Suite',
    code: 'LPX-REVOPS',
    type: 'Recurring Subscription',
    sellingPrice: 1200,
    costPrice: 320,
    notes: 'Core recurring subscription orchestration and ledger engine',
    status: 'Active',
    variantsCount: 2,
    createdAt: '2025-10-01',
  },
  {
    id: 'prod-2',
    name: 'High-Throughput API Gateway',
    code: 'LPX-API-GW',
    type: 'Usage Metered',
    sellingPrice: 450,
    costPrice: 90,
    notes: 'Dedicated low-latency API quota for ERP synchronization',
    status: 'Active',
    variantsCount: 1,
    createdAt: '2025-10-15',
  },
  {
    id: 'prod-3',
    name: 'Odoo Enterprise Connector',
    code: 'LPX-ODOO-MOD',
    type: 'Addon',
    sellingPrice: 560,
    costPrice: 110,
    notes: 'Bi-directional real-time ledger synchronization for Odoo ERP',
    status: 'Active',
    variantsCount: 1,
    createdAt: '2025-11-01',
  },
  {
    id: 'prod-4',
    name: 'Enterprise 24/7 SLA & Dedicated TAM',
    code: 'LPX-SLA-ENT',
    type: 'Recurring Subscription',
    sellingPrice: 850,
    costPrice: 300,
    notes: 'Guaranteed 15-minute response time with dedicated Technical Account Manager',
    status: 'Active',
    variantsCount: 0,
    createdAt: '2025-11-20',
  },
  {
    id: 'prod-5',
    name: 'One-Time Onboarding & Architecture Audit',
    code: 'LPX-AUDIT-SRV',
    type: 'One-Time Charge',
    sellingPrice: 2500,
    costPrice: 800,
    notes: 'Complete billing architecture review and data migration support',
    status: 'Active',
    variantsCount: 0,
    createdAt: '2025-12-01',
  },
];

const INITIAL_VARIANTS: ProductVariant[] = [
  {
    id: 'var-1',
    productId: 'prod-1',
    productName: 'LOOPNEX RevOps Platform Suite',
    name: 'Odoo Brand Integrated Edition',
    additionalPrice: 560, // Prompt requirement example: "Selecting the Odoo brand adds ₹560 / $560 to product price"
    sku: 'LPX-REVOPS-ODOO',
    status: 'Active',
    createdAt: '2025-11-05',
  },
  {
    id: 'var-2',
    productId: 'prod-1',
    productName: 'LOOPNEX RevOps Platform Suite',
    name: 'Multi-Region High Availability Cluster',
    additionalPrice: 400,
    sku: 'LPX-REVOPS-HA',
    status: 'Active',
    createdAt: '2025-11-08',
  },
  {
    id: 'var-3',
    productId: 'prod-2',
    productName: 'High-Throughput API Gateway',
    name: '10M Extra Calls Pool',
    additionalPrice: 250,
    sku: 'LPX-API-10M',
    status: 'Active',
    createdAt: '2025-12-10',
  },
  {
    id: 'var-4',
    productId: 'prod-3',
    productName: 'Odoo Enterprise Connector',
    name: 'Multi-Company Sync Extension',
    additionalPrice: 320,
    sku: 'LPX-ODOO-MULTICOMP',
    status: 'Active',
    createdAt: '2026-01-05',
  },
];

const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-1',
    name: 'Standard Growth — Monthly',
    code: 'PLAN-GROWTH-M',
    productId: 'prod-1',
    productName: 'LOOPNEX RevOps Platform Suite',
    frequency: 'Monthly',
    price: 1200,
    minQuantity: 1,
    startDate: '2025-10-01',
    autoClose: false,
    allowPause: true,
    allowEarlyClosure: true,
    allowRenewal: true,
    status: 'Active',
    subscribersCount: 18,
    createdAt: '2025-10-01',
  },
  {
    id: 'plan-2',
    name: 'Enterprise Scale — Annual (Save 15%)',
    code: 'PLAN-SCALE-Y',
    productId: 'prod-1',
    productName: 'LOOPNEX RevOps Platform Suite',
    frequency: 'Yearly',
    price: 12240, // $1,020 / mo
    minQuantity: 1,
    startDate: '2025-10-01',
    autoClose: false,
    allowPause: true,
    allowEarlyClosure: false,
    allowRenewal: true,
    status: 'Active',
    subscribersCount: 8,
    createdAt: '2025-10-01',
  },
  {
    id: 'plan-3',
    name: 'Developer Sandbox — Weekly',
    code: 'PLAN-SANDBOX-W',
    productId: 'prod-2',
    productName: 'High-Throughput API Gateway',
    frequency: 'Weekly',
    price: 120,
    minQuantity: 1,
    startDate: '2025-11-01',
    autoClose: true,
    allowPause: false,
    allowEarlyClosure: true,
    allowRenewal: false,
    status: 'Active',
    subscribersCount: 4,
    createdAt: '2025-11-01',
  },
  {
    id: 'plan-4',
    name: 'Burst Compute — Daily Cadence',
    code: 'PLAN-BURST-D',
    productId: 'prod-2',
    productName: 'High-Throughput API Gateway',
    frequency: 'Daily',
    price: 25,
    minQuantity: 2,
    startDate: '2025-12-01',
    autoClose: true,
    allowPause: false,
    allowEarlyClosure: true,
    allowRenewal: true,
    status: 'Active',
    subscribersCount: 12,
    createdAt: '2025-12-01',
  },
  {
    id: 'plan-5',
    name: 'Premium 24/7 SLA Support',
    code: 'PLAN-SLA-M',
    productId: 'prod-4',
    productName: 'Enterprise 24/7 SLA & Dedicated TAM',
    frequency: 'Monthly',
    price: 850,
    minQuantity: 1,
    startDate: '2025-11-20',
    autoClose: false,
    allowPause: true,
    allowEarlyClosure: true,
    allowRenewal: true,
    status: 'Active',
    subscribersCount: 6,
    createdAt: '2025-11-20',
  },
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quot-1',
    quotationNumber: 'QUOT-2026-081',
    customerId: 'cust-5',
    customerName: 'Hyperion Robotics Ltd',
    customerEmail: 'contact@hyperion.tech',
    templateName: 'Standard Enterprise Expansion Template',
    validUntil: '2026-11-30',
    status: 'Accepted',
    lines: [
      {
        productId: 'prod-1',
        productName: 'LOOPNEX RevOps Platform Suite',
        planId: 'plan-1',
        planName: 'Standard Growth — Monthly',
        variantName: 'Odoo Brand Integrated Edition (+560)',
        quantity: 1,
        unitPrice: 1760,
        taxRate: 18,
        total: 2076.8,
      },
      {
        productId: 'prod-4',
        productName: 'Enterprise 24/7 SLA & Dedicated TAM',
        planId: 'plan-5',
        planName: 'Premium 24/7 SLA Support',
        quantity: 1,
        unitPrice: 850,
        taxRate: 18,
        total: 1003.0,
      },
    ],
    subtotal: 2610,
    taxTotal: 469.8,
    total: 3079.8,
    createdAt: '2026-10-15',
  },
  {
    id: 'quot-2',
    quotationNumber: 'QUOT-2026-082',
    customerId: 'cust-1',
    customerName: 'Acme Global Technologies',
    customerEmail: 'billing@acmeglobal.io',
    templateName: 'High Volume API Add-on',
    validUntil: '2026-11-15',
    status: 'Sent',
    lines: [
      {
        productId: 'prod-2',
        productName: 'High-Throughput API Gateway',
        planId: 'plan-1',
        planName: 'Standard Growth',
        quantity: 2,
        unitPrice: 450,
        taxRate: 18,
        total: 1062,
      },
    ],
    subtotal: 900,
    taxTotal: 162,
    total: 1062,
    createdAt: '2026-10-22',
  },
  {
    id: 'quot-3',
    quotationNumber: 'QUOT-2026-083',
    customerId: 'cust-6',
    customerName: 'Nexus FinTech Systems',
    customerEmail: 'accounting@nexusfin.io',
    templateName: 'Fintech Scale Up Template',
    validUntil: '2026-12-01',
    status: 'Draft',
    lines: [
      {
        productId: 'prod-1',
        productName: 'LOOPNEX RevOps Platform Suite',
        planId: 'plan-2',
        planName: 'Enterprise Scale — Annual',
        quantity: 1,
        unitPrice: 12240,
        taxRate: 18,
        total: 14443.2,
      },
    ],
    subtotal: 12240,
    taxTotal: 2203.2,
    total: 14443.2,
    createdAt: '2026-10-28',
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    subscriptionNumber: 'SUB-2026-001',
    customerId: 'cust-1',
    customerName: 'Acme Global Technologies',
    customerEmail: 'billing@acmeglobal.io',
    planId: 'plan-1',
    planName: 'Standard Growth — Monthly',
    frequency: 'Monthly',
    startDate: '2025-11-15',
    expiryDate: '2026-11-15',
    paymentTerms: 'Net 30',
    status: 'Active',
    lines: [
      {
        productId: 'prod-1',
        productName: 'LOOPNEX RevOps Platform Suite',
        planId: 'plan-1',
        planName: 'Standard Growth — Monthly',
        quantity: 1,
        unitPrice: 1200,
        taxRate: 18,
        total: 1416,
      },
    ],
    amount: 1200,
    taxAmount: 216,
    totalAmount: 1416,
    autoRenew: true,
    createdAt: '2025-11-15',
  },
  {
    id: 'sub-2',
    subscriptionNumber: 'SUB-2026-002',
    customerId: 'cust-2',
    customerName: 'Synthetix Dynamics Corp',
    customerEmail: 'finance@synthetix.com',
    planId: 'plan-2',
    planName: 'Enterprise Scale — Annual',
    frequency: 'Yearly',
    startDate: '2025-12-01',
    expiryDate: '2026-12-01',
    paymentTerms: 'Net 15',
    status: 'Active',
    lines: [
      {
        productId: 'prod-1',
        productName: 'LOOPNEX RevOps Platform Suite',
        planId: 'plan-2',
        planName: 'Enterprise Scale — Annual',
        quantity: 1,
        unitPrice: 12240,
        taxRate: 18,
        total: 14443.2,
      },
    ],
    amount: 12240,
    taxAmount: 2203.2,
    totalAmount: 14443.2,
    autoRenew: true,
    createdAt: '2025-12-01',
  },
  {
    id: 'sub-3',
    subscriptionNumber: 'SUB-2026-003',
    customerId: 'cust-3',
    customerName: 'Vanguard Biometrics',
    customerEmail: 'accounts@vanguardbio.org',
    planId: 'plan-5',
    planName: 'Premium 24/7 SLA Support',
    frequency: 'Monthly',
    startDate: '2026-01-10',
    expiryDate: '2027-01-10',
    paymentTerms: 'Immediate',
    status: 'Active',
    lines: [
      {
        productId: 'prod-4',
        productName: 'Enterprise 24/7 SLA & Dedicated TAM',
        planId: 'plan-5',
        planName: 'Premium 24/7 SLA Support',
        quantity: 1,
        unitPrice: 850,
        taxRate: 18,
        total: 1003,
      },
    ],
    amount: 850,
    taxAmount: 153,
    totalAmount: 1003,
    autoRenew: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'sub-4',
    subscriptionNumber: 'SUB-2026-004',
    customerId: 'cust-4',
    customerName: 'Oasis Cloud Infrastructure',
    customerEmail: 'ops@oasiscloud.net',
    planId: 'plan-1',
    planName: 'Standard Growth — Monthly',
    frequency: 'Monthly',
    startDate: '2026-02-01',
    expiryDate: '2027-02-01',
    paymentTerms: 'Net 30',
    status: 'Paused',
    lines: [
      {
        productId: 'prod-1',
        productName: 'LOOPNEX RevOps Platform Suite',
        planId: 'plan-1',
        planName: 'Standard Growth — Monthly',
        quantity: 1,
        unitPrice: 1200,
        taxRate: 18,
        total: 1416,
      },
    ],
    amount: 1200,
    taxAmount: 216,
    totalAmount: 1416,
    autoRenew: false,
    createdAt: '2026-02-01',
  },
  {
    id: 'sub-5',
    subscriptionNumber: 'SUB-2026-005',
    customerId: 'cust-6',
    customerName: 'Nexus FinTech Systems',
    customerEmail: 'accounting@nexusfin.io',
    planId: 'plan-3',
    planName: 'Developer Sandbox — Weekly',
    frequency: 'Weekly',
    startDate: '2025-08-01',
    expiryDate: '2025-09-30',
    paymentTerms: 'Immediate',
    status: 'Closed',
    lines: [
      {
        productId: 'prod-2',
        productName: 'High-Throughput API Gateway',
        planId: 'plan-3',
        planName: 'Developer Sandbox — Weekly',
        quantity: 1,
        unitPrice: 120,
        taxRate: 18,
        total: 141.6,
      },
    ],
    amount: 120,
    taxAmount: 21.6,
    totalAmount: 141.6,
    autoRenew: false,
    createdAt: '2025-08-01',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Acme Global Technologies',
    customerEmail: 'billing@acmeglobal.io',
    subscriptionId: 'sub-1',
    subscriptionNumber: 'SUB-2026-001',
    issueDate: '2026-10-15',
    dueDate: '2026-11-15',
    status: 'Confirmed',
    lines: [
      {
        description: 'LOOPNEX RevOps Platform Suite — Monthly Cycle (Oct 15 - Nov 15)',
        quantity: 1,
        unitPrice: 1200,
        amount: 1200,
      },
    ],
    subtotal: 1200,
    taxRate: 18,
    taxTotal: 216,
    total: 1416,
    amountPaid: 0,
    balanceDue: 1416,
    createdAt: '2026-10-15',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-2',
    customerName: 'Synthetix Dynamics Corp',
    customerEmail: 'finance@synthetix.com',
    subscriptionId: 'sub-2',
    subscriptionNumber: 'SUB-2026-002',
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'Paid',
    lines: [
      {
        description: 'Enterprise Scale — Annual License (2025-2026)',
        quantity: 1,
        unitPrice: 12240,
        amount: 12240,
      },
    ],
    subtotal: 12240,
    taxRate: 18,
    taxTotal: 2203.2,
    total: 14443.2,
    amountPaid: 14443.2,
    balanceDue: 0,
    createdAt: '2026-09-01',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    customerId: 'cust-3',
    customerName: 'Vanguard Biometrics',
    customerEmail: 'accounts@vanguardbio.org',
    subscriptionId: 'sub-3',
    subscriptionNumber: 'SUB-2026-003',
    issueDate: '2026-10-10',
    dueDate: '2026-10-25',
    status: 'Paid',
    lines: [
      {
        description: 'Enterprise 24/7 SLA Support — Oct 2026',
        quantity: 1,
        unitPrice: 850,
        amount: 850,
      },
    ],
    subtotal: 850,
    taxRate: 18,
    taxTotal: 153,
    total: 1003,
    amountPaid: 1003,
    balanceDue: 0,
    createdAt: '2026-10-10',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-004',
    customerId: 'cust-4',
    customerName: 'Oasis Cloud Infrastructure',
    customerEmail: 'ops@oasiscloud.net',
    subscriptionId: 'sub-4',
    subscriptionNumber: 'SUB-2026-004',
    issueDate: '2026-08-01',
    dueDate: '2026-08-31',
    status: 'Overdue',
    lines: [
      {
        description: 'LOOPNEX RevOps Platform Suite — August billing cycle',
        quantity: 1,
        unitPrice: 1200,
        amount: 1200,
      },
      {
        description: 'Odoo Enterprise Connector Add-on',
        quantity: 1,
        unitPrice: 560,
        amount: 560,
      },
    ],
    subtotal: 1760,
    taxRate: 18,
    taxTotal: 316.8,
    total: 2076.8,
    amountPaid: 0,
    balanceDue: 2076.8,
    createdAt: '2026-08-01',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-005',
    customerId: 'cust-4',
    customerName: 'Oasis Cloud Infrastructure',
    customerEmail: 'ops@oasiscloud.net',
    subscriptionId: 'sub-4',
    subscriptionNumber: 'SUB-2026-004',
    issueDate: '2026-09-01',
    dueDate: '2026-09-30',
    status: 'Overdue',
    lines: [
      {
        description: 'LOOPNEX RevOps Platform Suite — September billing cycle',
        quantity: 1,
        unitPrice: 1200,
        amount: 1200,
      },
    ],
    subtotal: 1200,
    taxRate: 18,
    taxTotal: 216,
    total: 1416,
    amountPaid: 0,
    balanceDue: 1416,
    createdAt: '2026-09-01',
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-006',
    customerId: 'cust-5',
    customerName: 'Hyperion Robotics Ltd',
    customerEmail: 'contact@hyperion.tech',
    issueDate: '2026-10-29',
    dueDate: '2026-11-28',
    status: 'Draft',
    lines: [
      {
        description: 'One-Time Onboarding & Architecture Audit',
        quantity: 1,
        unitPrice: 2500,
        amount: 2500,
      },
    ],
    subtotal: 2500,
    taxRate: 18,
    taxTotal: 450,
    total: 2950,
    amountPaid: 0,
    balanceDue: 2950,
    createdAt: '2026-10-29',
  },
];

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-1',
    code: 'WELCOME2026',
    type: 'Percentage',
    value: 15,
    minPurchaseAmount: 1000,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    maxUsageLimit: 100,
    usageCount: 24,
    scope: 'Subscription-wide',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'disc-2',
    code: 'ODOOCONNECT',
    type: 'Fixed Amount',
    value: 200,
    minPurchaseAmount: 500,
    minQuantity: 1,
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    maxUsageLimit: 50,
    usageCount: 18,
    scope: 'Product-specific',
    applicableProductId: 'prod-3',
    applicableProductName: 'Odoo Enterprise Connector',
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'disc-3',
    code: 'ENTERPRISE_PROMO',
    type: 'Percentage',
    value: 20,
    minPurchaseAmount: 10000,
    minQuantity: 1,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    maxUsageLimit: 20,
    usageCount: 5,
    scope: 'Subscription-wide',
    status: 'Active',
    createdAt: '2026-03-01',
  },
  {
    id: 'disc-4',
    code: 'BLACKFRIDAY_OLD',
    type: 'Percentage',
    value: 30,
    minPurchaseAmount: 1500,
    minQuantity: 1,
    startDate: '2025-11-20',
    endDate: '2025-11-30',
    maxUsageLimit: 200,
    usageCount: 188,
    scope: 'Subscription-wide',
    status: 'Expired',
    createdAt: '2025-11-01',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    referenceNumber: 'PAY-2026-901',
    invoiceId: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-2',
    customerName: 'Synthetix Dynamics Corp',
    amount: 14443.2,
    paymentDate: '2026-09-05',
    method: 'Bank Transfer',
    notes: 'Direct wire transfer received via J.P. Morgan',
    status: 'Completed',
    createdAt: '2026-09-05',
  },
  {
    id: 'pay-2',
    referenceNumber: 'PAY-2026-902',
    invoiceId: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    customerId: 'cust-3',
    customerName: 'Vanguard Biometrics',
    amount: 1003,
    paymentDate: '2026-10-12',
    method: 'Credit Card',
    notes: 'Stripe Corporate Amex processed',
    status: 'Completed',
    createdAt: '2026-10-12',
  },
  {
    id: 'pay-3',
    referenceNumber: 'PAY-2026-903',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Acme Global Technologies',
    amount: 1416,
    paymentDate: '2026-10-30',
    method: 'ACH Direct Debit',
    notes: 'ACH clearing pending bank batch settlement',
    status: 'Pending',
    createdAt: '2026-10-30',
  },
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-1',
    name: 'Alex Drake',
    email: 'admin@loopnex.io',
    department: 'Executive Operations',
    role: 'Admin',
    phone: '+1 (555) 019-2834',
    isActive: true,
    accessClearance: 'Level 4 (Root)',
    lastActive: 'Just now',
    createdAt: '2025-10-01',
  },
  {
    id: 'stf-2',
    name: 'Sarah Jenkins',
    email: 'staff@loopnex.io',
    department: 'Revenue Operations',
    role: 'Operations',
    phone: '+1 (555) 014-9921',
    isActive: true,
    accessClearance: 'Level 2 (Standard)',
    lastActive: '12m ago',
    createdAt: '2025-10-15',
  },
  {
    id: 'stf-3',
    name: 'Marcus Vance',
    email: 'm.vance@loopnex.io',
    department: 'Finance & Compliance',
    role: 'Finance',
    phone: '+1 (555) 234-8899',
    isActive: true,
    accessClearance: 'Level 3 (Financial)',
    lastActive: '2h ago',
    createdAt: '2025-11-01',
  },
  {
    id: 'stf-4',
    name: 'Zoia M.',
    email: 'zoia.m@loopnex.io',
    department: 'Customer Success',
    role: 'Customer Support',
    phone: '+1 (555) 902-1200',
    isActive: true,
    accessClearance: 'Level 1 (Triage)',
    lastActive: '5m ago',
    createdAt: '2025-12-10',
  },
];

const INITIAL_TAXES: TaxRule[] = [
  {
    id: 'tax-1',
    name: 'GST (Goods & Services Tax) — Standard',
    rate: 18.0,
    type: 'Percentage',
    applicableScope: 'All Software Subscriptions & Digital Services',
    description: 'Mandatory standard goods and services tax rate',
    isActive: true,
    createdAt: '2025-10-01',
  },
  {
    id: 'tax-2',
    name: 'EU Digital VAT',
    rate: 20.0,
    type: 'Percentage',
    applicableScope: 'European Union Customers',
    description: 'Value Added Tax for cross-border SaaS consumption',
    isActive: true,
    createdAt: '2025-10-05',
  },
  {
    id: 'tax-3',
    name: 'US Regional Sales Tax',
    rate: 8.25,
    type: 'Percentage',
    applicableScope: 'US Domestic Nexus Entities',
    description: 'Blended state & municipal software sales tax',
    isActive: true,
    createdAt: '2025-11-01',
  },
  {
    id: 'tax-4',
    name: 'Zero-Rated / Tax Exempt Export',
    rate: 0.0,
    type: 'Percentage',
    applicableScope: 'SEZ Units & International B2B Exports',
    description: 'Exempt under valid international tax exemption treaty',
    isActive: true,
    createdAt: '2025-11-01',
  },
];

const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'LOOPNEX Operations Platform Inc.',
  tradingName: 'LOOPNEX Systems',
  taxId: 'US-EIN-982140219',
  supportEmail: 'billing-support@loopnex.io',
  billingPhone: '+1 (800) 555-LOOP',
  currency: 'USD ($)',
  address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
  defaultPaymentTerms: 'Net 30 Days',
  gracePeriodDays: 7,
  enableAutoDunning: true,
  twoFactorRequired: true,
  auditRetentionDays: 365,
};

const STORAGE_KEY = 'loopnex_admin_state_v1';

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with seed data
  const loadInitial = <T,>(key: string, defaultData: T): T => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : defaultData;
    } catch {
      return defaultData;
    }
  };

  const [customers, setCustomers] = useState<Customer[]>(() => loadInitial('customers', INITIAL_CUSTOMERS));
  const [products, setProducts] = useState<Product[]>(() => loadInitial('products', INITIAL_PRODUCTS));
  const [variants, setVariants] = useState<ProductVariant[]>(() => loadInitial('variants', INITIAL_VARIANTS));
  const [plans, setPlans] = useState<Plan[]>(() => loadInitial('plans', INITIAL_PLANS));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadInitial('quotations', INITIAL_QUOTATIONS));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadInitial('subscriptions', INITIAL_SUBSCRIPTIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInitial('invoices', INITIAL_INVOICES));
  const [discounts, setDiscounts] = useState<Discount[]>(() => loadInitial('discounts', INITIAL_DISCOUNTS));
  const [payments, setPayments] = useState<Payment[]>(() => loadInitial('payments', INITIAL_PAYMENTS));
  const [staff, setStaff] = useState<Staff[]>(() => loadInitial('staff', INITIAL_STAFF));
  const [taxes, setTaxes] = useState<TaxRule[]>(() => loadInitial('taxes', INITIAL_TAXES));
  const [settings, setSettings] = useState<CompanySettings>(() => loadInitial('settings', INITIAL_SETTINGS));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_variants`, JSON.stringify(variants));
      localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(plans));
      localStorage.setItem(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations));
      localStorage.setItem(`${STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptions));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${STORAGE_KEY}_discounts`, JSON.stringify(discounts));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
      localStorage.setItem(`${STORAGE_KEY}_taxes`, JSON.stringify(taxes));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('loopnex_store_sync', { detail: { source: 'admin' } }));
    } catch {
      // Ignore quota errors
    }
  }, [customers, products, variants, plans, quotations, subscriptions, invoices, discounts, payments, staff, taxes, settings]);

  // Listen for sync events dispatched by Customer Portal or other tabs
  useEffect(() => {
    const handleSync = (e: any) => {
      if (e?.detail?.source === 'admin') return;
      try {
        const storedSubs = localStorage.getItem(`${STORAGE_KEY}_subscriptions`);
        if (storedSubs) setSubscriptions(JSON.parse(storedSubs));
        const storedInvs = localStorage.getItem(`${STORAGE_KEY}_invoices`);
        if (storedInvs) setInvoices(JSON.parse(storedInvs));
        const storedPays = localStorage.getItem(`${STORAGE_KEY}_payments`);
        if (storedPays) setPayments(JSON.parse(storedPays));
        const storedCusts = localStorage.getItem(`${STORAGE_KEY}_customers`);
        if (storedCusts) setCustomers(JSON.parse(storedCusts));
        const storedPlans = localStorage.getItem(`${STORAGE_KEY}_plans`);
        if (storedPlans) setPlans(JSON.parse(storedPlans));
      } catch (err) {
        console.error('Failed to sync admin state', err);
      }
    };
    window.addEventListener('loopnex_store_sync', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('loopnex_store_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Toast System
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Customers Actions
  // ---------------------------------------------------------------------------
  const addCustomer = useCallback(
    (data: Omit<Customer, 'id' | 'createdAt' | 'balance' | 'activeSubscriptionsCount' | 'totalInvoiced'>) => {
      const newCustomer: Customer = {
        ...data,
        id: `cust-${Date.now()}`,
        balance: 0,
        activeSubscriptionsCount: 0,
        totalInvoiced: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      showToast(`Customer "${newCustomer.name}" added successfully.`);
    },
    [showToast]
  );

  const updateCustomer = useCallback(
    (id: string, data: Partial<Customer>) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      showToast('Customer details updated.');
    },
    [showToast]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer record removed.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Products Actions
  // ---------------------------------------------------------------------------
  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'createdAt' | 'variantsCount'>) => {
      const newProduct: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        variantsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Product "${newProduct.name}" created.`);
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (id: string, data: Partial<Product>) => {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      showToast('Product updated successfully.');
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product deleted.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Variants Actions
  // ---------------------------------------------------------------------------
  const addVariant = useCallback(
    (data: Omit<ProductVariant, 'id' | 'createdAt'>) => {
      const newVariant: ProductVariant = {
        ...data,
        id: `var-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setVariants((prev) => [newVariant, ...prev]);
      // Update parent product variants count
      setProducts((prev) =>
        prev.map((p) => (p.id === data.productId ? { ...p, variantsCount: p.variantsCount + 1 } : p))
      );
      showToast(`Product variant "${newVariant.name}" added.`);
    },
    [showToast]
  );

  const updateVariant = useCallback(
    (id: string, data: Partial<ProductVariant>) => {
      setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
      showToast('Product variant updated.');
    },
    [showToast]
  );

  const deleteVariant = useCallback(
    (id: string) => {
      const target = variants.find((v) => v.id === id);
      if (target) {
        setProducts((prev) =>
          prev.map((p) => (p.id === target.productId ? { ...p, variantsCount: Math.max(0, p.variantsCount - 1) } : p))
        );
      }
      setVariants((prev) => prev.filter((v) => v.id !== id));
      showToast('Variant removed.', 'info');
    },
    [variants, showToast]
  );

  // ---------------------------------------------------------------------------
  // Plans Actions
  // ---------------------------------------------------------------------------
  const addPlan = useCallback(
    (data: Omit<Plan, 'id' | 'createdAt' | 'subscribersCount'>) => {
      const newPlan: Plan = {
        ...data,
        id: `plan-${Date.now()}`,
        subscribersCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPlans((prev) => [newPlan, ...prev]);
      showToast(`Plan "${newPlan.name}" configured.`);
    },
    [showToast]
  );

  const updatePlan = useCallback(
    (id: string, data: Partial<Plan>) => {
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      showToast('Plan configuration saved.');
    },
    [showToast]
  );

  const deletePlan = useCallback(
    (id: string) => {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      showToast('Plan deleted.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Quotations Actions
  // ---------------------------------------------------------------------------
  const addQuotation = useCallback(
    (data: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>): Quotation => {
      const num = `QUOT-2026-${String(quotations.length + 84).padStart(3, '0')}`;
      const newQuot: Quotation = {
        ...data,
        id: `quot-${Date.now()}`,
        quotationNumber: num,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setQuotations((prev) => [newQuot, ...prev]);
      showToast(`Quotation ${num} generated.`);
      return newQuot;
    },
    [quotations.length, showToast]
  );

  const updateQuotation = useCallback(
    (id: string, data: Partial<Quotation>) => {
      setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
      showToast('Quotation updated.');
    },
    [showToast]
  );

  const deleteQuotation = useCallback(
    (id: string) => {
      setQuotations((prev) => prev.filter((q) => q.id !== id));
      showToast('Quotation removed.', 'info');
    },
    [showToast]
  );

  // One-Click Conversion: Quotation -> Subscription
  const convertQuotationToSubscription = useCallback(
    (id: string): Subscription | null => {
      const quote = quotations.find((q) => q.id === id);
      if (!quote) return null;

      const subNum = `SUB-2026-${String(subscriptions.length + 1).padStart(3, '0')}`;
      const startDate = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      const newSub: Subscription = {
        id: `sub-${Date.now()}`,
        subscriptionNumber: subNum,
        customerId: quote.customerId,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        planId: quote.lines[0]?.planId || 'plan-1',
        planName: quote.lines[0]?.planName || 'Converted Plan',
        frequency: 'Monthly',
        startDate,
        expiryDate: expiry.toISOString().split('T')[0],
        paymentTerms: 'Net 30',
        status: 'Active',
        lines: quote.lines.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          planId: l.planId || 'plan-1',
          planName: l.planName || 'Plan',
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          total: l.total,
        })),
        amount: quote.subtotal,
        taxAmount: quote.taxTotal,
        totalAmount: quote.total,
        autoRenew: true,
        createdAt: startDate,
      };

      setSubscriptions((prev) => [newSub, ...prev]);
      setQuotations((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'Converted', convertedSubscriptionId: newSub.id } : q))
      );

      // Increment customer active subscription count
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === quote.customerId ? { ...c, activeSubscriptionsCount: c.activeSubscriptionsCount + 1 } : c
        )
      );

      showToast(`Quotation ${quote.quotationNumber} converted to active Subscription ${subNum}!`);
      return newSub;
    },
    [quotations, subscriptions.length, showToast]
  );

  // ---------------------------------------------------------------------------
  // Subscriptions Actions
  // ---------------------------------------------------------------------------
  const addSubscription = useCallback(
    (data: Omit<Subscription, 'id' | 'subscriptionNumber' | 'createdAt'>) => {
      const num = `SUB-2026-${String(subscriptions.length + 1).padStart(3, '0')}`;
      const newSub: Subscription = {
        ...data,
        id: `sub-${Date.now()}`,
        subscriptionNumber: num,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSubscriptions((prev) => [newSub, ...prev]);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === data.customerId ? { ...c, activeSubscriptionsCount: c.activeSubscriptionsCount + 1 } : c
        )
      );
      showToast(`Subscription ${num} activated.`);
    },
    [subscriptions.length, showToast]
  );

  const updateSubscription = useCallback(
    (id: string, data: Partial<Subscription>) => {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      showToast('Subscription updated.');
    },
    [showToast]
  );

  const updateSubscriptionStatus = useCallback(
    (id: string, status: Subscription['status']) => {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      showToast(`Subscription status changed to "${status}".`);
    },
    [showToast]
  );

  const pauseSubscription = useCallback(
    (id: string) => {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Paused' } : s)));
      showToast('Subscription paused.', 'info');
    },
    [showToast]
  );

  const resumeSubscription = useCallback(
    (id: string) => {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Active' } : s)));
      showToast('Subscription resumed to Active status.');
    },
    [showToast]
  );

  const renewSubscription = useCallback(
    (id: string) => {
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const currentExp = new Date(s.expiryDate);
          currentExp.setFullYear(currentExp.getFullYear() + 1);
          return {
            ...s,
            status: 'Active',
            expiryDate: currentExp.toISOString().split('T')[0],
          };
        })
      );
      showToast('Subscription successfully renewed for +1 year.');
    },
    [showToast]
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      const target = subscriptions.find((s) => s.id === id);
      if (target) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === target.customerId
              ? { ...c, activeSubscriptionsCount: Math.max(0, c.activeSubscriptionsCount - 1) }
              : c
          )
        );
      }
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      showToast('Subscription deleted.', 'info');
    },
    [subscriptions, showToast]
  );

  // ---------------------------------------------------------------------------
  // Invoices Actions
  // ---------------------------------------------------------------------------
  const addInvoice = useCallback(
    (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
      const num = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
      const newInv: Invoice = {
        ...data,
        id: `inv-${Date.now()}`,
        invoiceNumber: num,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setInvoices((prev) => [newInv, ...prev]);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === data.customerId
            ? { ...c, totalInvoiced: c.totalInvoiced + data.total, balance: c.balance + data.balanceDue }
            : c
        )
      );
      showToast(`Invoice ${num} generated.`);
    },
    [invoices.length, showToast]
  );

  const updateInvoice = useCallback(
    (id: string, data: Partial<Invoice>) => {
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)));
      showToast('Invoice updated.');
    },
    [showToast]
  );

  const confirmInvoice = useCallback(
    (id: string) => {
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'Confirmed' } : inv)));
      showToast('Invoice confirmed and dispatched.');
    },
    [showToast]
  );

  const cancelInvoice = useCallback(
    (id: string) => {
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'Cancelled' } : inv)));
      showToast('Invoice cancelled.', 'info');
    },
    [showToast]
  );

  const markInvoicePaid = useCallback(
    (id: string, method = 'Credit Card') => {
      const inv = invoices.find((i) => i.id === id);
      if (!inv) return;

      setInvoices((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'Paid', amountPaid: i.total, balanceDue: 0 } : i
        )
      );

      // Create linked payment record
      const payRef = `PAY-2026-${String(payments.length + 904).padStart(3, '0')}`;
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        referenceNumber: payRef,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: inv.customerName,
        amount: inv.balanceDue,
        paymentDate: new Date().toISOString().split('T')[0],
        method: method as any,
        notes: `Full payment recorded for ${inv.invoiceNumber}`,
        status: 'Completed',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setPayments((prev) => [newPay, ...prev]);

      // Reduce customer balance
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === inv.customerId ? { ...c, balance: Math.max(0, c.balance - inv.balanceDue) } : c
        )
      );

      showToast(`Invoice ${inv.invoiceNumber} marked Paid ($${inv.balanceDue.toLocaleString()}).`);
    },
    [invoices, payments.length, showToast]
  );

  const deleteInvoice = useCallback(
    (id: string) => {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      showToast('Invoice deleted.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Discounts Actions
  // ---------------------------------------------------------------------------
  const addDiscount = useCallback(
    (data: Omit<Discount, 'id' | 'createdAt' | 'usageCount'>) => {
      const newDisc: Discount = {
        ...data,
        id: `disc-${Date.now()}`,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDiscounts((prev) => [newDisc, ...prev]);
      showToast(`Discount rule "${newDisc.code}" created.`);
    },
    [showToast]
  );

  const updateDiscount = useCallback(
    (id: string, data: Partial<Discount>) => {
      setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
      showToast('Discount rule updated.');
    },
    [showToast]
  );

  const toggleDiscountStatus = useCallback(
    (id: string) => {
      setDiscounts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: d.status === 'Active' ? 'Expired' : 'Active' } : d))
      );
      showToast('Discount status toggled.');
    },
    [showToast]
  );

  const deleteDiscount = useCallback(
    (id: string) => {
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      showToast('Discount rule deleted.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Payments Actions
  // ---------------------------------------------------------------------------
  const addPayment = useCallback(
    (data: Omit<Payment, 'id' | 'referenceNumber' | 'createdAt'>) => {
      const ref = `PAY-2026-${String(payments.length + 904).padStart(3, '0')}`;
      const newPay: Payment = {
        ...data,
        id: `pay-${Date.now()}`,
        referenceNumber: ref,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPayments((prev) => [newPay, ...prev]);

      // If associated invoice exists, update balance
      if (data.invoiceId) {
        setInvoices((prev) =>
          prev.map((i) => {
            if (i.id !== data.invoiceId) return i;
            const newPaid = i.amountPaid + data.amount;
            const newBalance = Math.max(0, i.total - newPaid);
            return {
              ...i,
              amountPaid: newPaid,
              balanceDue: newBalance,
              status: newBalance === 0 ? 'Paid' : i.status,
            };
          })
        );
      }

      showToast(`Payment of $${data.amount.toLocaleString()} recorded (${ref}).`);
    },
    [payments.length, showToast]
  );

  const deletePayment = useCallback(
    (id: string) => {
      setPayments((prev) => prev.filter((p) => p.id !== id));
      showToast('Payment record removed.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Staff Actions
  // ---------------------------------------------------------------------------
  const addStaff = useCallback(
    (data: Omit<Staff, 'id' | 'createdAt' | 'lastActive'>) => {
      const newStaff: Staff = {
        ...data,
        id: `stf-${Date.now()}`,
        lastActive: 'Just now',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setStaff((prev) => [newStaff, ...prev]);
      showToast(`Staff account created for ${newStaff.name}.`);
    },
    [showToast]
  );

  const updateStaff = useCallback(
    (id: string, data: Partial<Staff>) => {
      setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      showToast('Staff member updated.');
    },
    [showToast]
  );

  const toggleStaffStatus = useCallback(
    (id: string) => {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
      showToast('Staff access status updated.');
    },
    [showToast]
  );

  const deleteStaff = useCallback(
    (id: string) => {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      showToast('Staff member removed.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Taxes Actions
  // ---------------------------------------------------------------------------
  const addTax = useCallback(
    (data: Omit<TaxRule, 'id' | 'createdAt'>) => {
      const newTax: TaxRule = {
        ...data,
        id: `tax-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTaxes((prev) => [newTax, ...prev]);
      showToast(`Tax rule "${newTax.name}" configured.`);
    },
    [showToast]
  );

  const updateTax = useCallback(
    (id: string, data: Partial<TaxRule>) => {
      setTaxes((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      showToast('Tax rule updated.');
    },
    [showToast]
  );

  const toggleTaxStatus = useCallback(
    (id: string) => {
      setTaxes((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
      showToast('Tax rule active status updated.');
    },
    [showToast]
  );

  const deleteTax = useCallback(
    (id: string) => {
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      showToast('Tax rule removed.', 'info');
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Settings Actions
  // ---------------------------------------------------------------------------
  const updateSettings = useCallback(
    (data: Partial<CompanySettings>) => {
      setSettings((prev) => ({ ...prev, ...data }));
      showToast('Company and administrative settings saved.');
    },
    [showToast]
  );

  const resetToDefaults = useCallback(() => {
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setVariants(INITIAL_VARIANTS);
    setPlans(INITIAL_PLANS);
    setQuotations(INITIAL_QUOTATIONS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setInvoices(INITIAL_INVOICES);
    setDiscounts(INITIAL_DISCOUNTS);
    setPayments(INITIAL_PAYMENTS);
    setStaff(INITIAL_STAFF);
    setTaxes(INITIAL_TAXES);
    setSettings(INITIAL_SETTINGS);
    showToast('Admin data reset to default demo records.', 'info');
  }, [showToast]);

  const value: AdminDataContextType = {
    customers,
    products,
    variants,
    plans,
    quotations,
    subscriptions,
    invoices,
    discounts,
    payments,
    staff,
    taxes,
    settings,
    toasts,
    showToast,
    dismissToast,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addVariant,
    updateVariant,
    deleteVariant,
    addPlan,
    updatePlan,
    deletePlan,
    addQuotation,
    updateQuotation,
    convertQuotationToSubscription,
    deleteQuotation,
    addSubscription,
    updateSubscription,
    updateSubscriptionStatus,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    deleteSubscription,
    addInvoice,
    updateInvoice,
    confirmInvoice,
    cancelInvoice,
    markInvoicePaid,
    deleteInvoice,
    addDiscount,
    updateDiscount,
    toggleDiscountStatus,
    deleteDiscount,
    addPayment,
    deletePayment,
    addStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
    addTax,
    updateTax,
    toggleTaxStatus,
    deleteTax,
    updateSettings,
    resetToDefaults,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export function useAdminData(): AdminDataContextType {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
