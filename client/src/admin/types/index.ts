// ==============================================================================
// LOOPNEX ADMIN PANEL — TYPE DEFINITIONS
// Minimal, clean, modern subscription operations types
// ==============================================================================

export type CustomerStatus = 'Active' | 'Inactive' | 'Lead' | 'Delinquent';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  currency: string;
  balance: number;
  activeSubscriptionsCount: number;
  totalInvoiced: number;
  createdAt: string;
}

export type ProductType =
  | 'Recurring Subscription'
  | 'One-Time Charge'
  | 'Usage Metered'
  | 'Addon';

export interface Product {
  id: string;
  name: string;
  code: string;
  type: ProductType;
  sellingPrice: number;
  costPrice: number;
  notes?: string;
  status: 'Active' | 'Archived';
  variantsCount: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  name: string; // e.g. "Odoo Brand Edition", "Enterprise SLA"
  additionalPrice: number; // e.g. 560
  sku: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type PlanFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Plan {
  id: string;
  name: string;
  code: string;
  productId: string;
  productName: string;
  frequency: PlanFrequency;
  price: number;
  minQuantity: number;
  startDate: string;
  endDate?: string;
  autoClose: boolean;
  allowPause: boolean;
  allowEarlyClosure: boolean;
  allowRenewal: boolean;
  status: 'Active' | 'Archived';
  subscribersCount: number;
  createdAt: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Converted';

export interface QuotationLine {
  productId: string;
  productName: string;
  planId?: string;
  planName?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  templateName: string;
  validUntil: string;
  status: QuotationStatus;
  lines: QuotationLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  convertedSubscriptionId?: string;
  createdAt: string;
}

export type SubscriptionStatus =
  | 'Draft'
  | 'Quotation'
  | 'Confirmed'
  | 'Active'
  | 'Paused'
  | 'Closed';

export interface SubscriptionLine {
  productId: string;
  productName: string;
  planId: string;
  planName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  frequency: PlanFrequency;
  startDate: string;
  expiryDate: string;
  paymentTerms: string;
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  amount: number;
  taxAmount: number;
  totalAmount: number;
  autoRenew: boolean;
  createdAt: string;
}

export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  createdAt: string;
}

export type DiscountType = 'Fixed Amount' | 'Percentage';
export type DiscountScope = 'Subscription-wide' | 'Product-specific';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // e.g. 50 (dollars) or 15 (percent)
  minPurchaseAmount: number;
  minQuantity: number;
  startDate: string;
  endDate: string;
  maxUsageLimit: number;
  usageCount: number;
  scope: DiscountScope;
  applicableProductId?: string;
  applicableProductName?: string;
  status: 'Active' | 'Expired';
  createdAt: string;
}

export type PaymentMethod =
  | 'Credit Card'
  | 'Bank Transfer'
  | 'ACH Direct Debit'
  | 'UPI'
  | 'PayPal';

export interface Payment {
  id: string;
  referenceNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  notes?: string;
  status: 'Completed' | 'Pending' | 'Failed';
  createdAt: string;
}

export type StaffRole = 'Admin' | 'Operations' | 'Finance' | 'Customer Support';

export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  role: StaffRole;
  phone: string;
  isActive: boolean;
  accessClearance: string;
  lastActive: string;
  createdAt: string;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // percentage, e.g. 18 for 18%
  type: 'Percentage' | 'Fixed Amount';
  applicableScope: string; // e.g. "All Products & Services"
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  tradingName: string;
  taxId: string;
  supportEmail: string;
  billingPhone: string;
  currency: string;
  address: string;
  defaultPaymentTerms: string;
  gracePeriodDays: number;
  enableAutoDunning: boolean;
  twoFactorRequired: boolean;
  auditRetentionDays: number;
}
