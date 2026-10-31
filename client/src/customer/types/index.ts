// ==============================================================================
// LOOPNEX CUSTOMER PORTAL — TYPE DEFINITIONS
// Isolated, client-scoped data models for self-service subscription management
// ==============================================================================

export type SubscriptionStatus =
  | 'Draft'
  | 'Quotation'
  | 'Confirmed'
  | 'Active'
  | 'Paused'
  | 'Closed';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  gstin: string;
  currency: string;
  memberSince: string;
}

export interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number; // per month
  isEnabled: boolean;
  category: 'storage' | 'reporting' | 'users' | 'support' | 'features';
}

export interface CustomerPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: 'Monthly' | 'Yearly';
  features: string[];
  isCurrent: boolean;
  recommended?: boolean;
}

export interface CustomerSubscription {
  subscriptionNumber: string;
  productName: string;
  planName: string;
  frequency: 'Monthly' | 'Yearly';
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
  paymentTerms: string;
  status: SubscriptionStatus;
  quantity: number;
  basePrice: number;
  addonsTotal: number;
  subtotal: number;
  taxRate: number; // 18%
  taxAmount: number;
  totalAmount: number;
  autoRenew: boolean;
  addons: AddonItem[];
}

export type InvoicePaymentStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Overdue';

export interface CustomerInvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  productName: string;
  status: InvoicePaymentStatus;
  lines: CustomerInvoiceLine[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
}

export interface CustomerPayment {
  id: string;
  referenceNumber: string;
  invoiceNumber: string;
  paymentDate: string;
  method: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  receiptUrl?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'Feature Request' | 'Subscription Change';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  message: string;
  response?: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
