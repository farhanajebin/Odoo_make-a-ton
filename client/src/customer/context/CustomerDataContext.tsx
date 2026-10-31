import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CustomerProfile,
  CustomerSubscription,
  CustomerPlan,
  AddonItem,
  CustomerInvoice,
  CustomerPayment,
  SupportTicket,
  ToastNotification,
  SubscriptionStatus,
} from '../types';

interface CustomerDataContextType {
  profile: CustomerProfile;
  subscription: CustomerSubscription;
  plans: CustomerPlan[];
  addons: AddonItem[];
  invoices: CustomerInvoice[];
  payments: CustomerPayment[];
  tickets: SupportTicket[];
  toasts: ToastNotification[];

  // Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  updateProfile: (data: Partial<CustomerProfile>) => void;
  toggleAddon: (addonId: string) => void;
  changePlan: (planId: string) => void;
  requestCancellation: (reason: string) => void;
  requestRenewal: () => void;
  togglePauseResumeSubscription: () => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => void;
  downloadInvoicePDF: (invoiceId: string) => void;
  resetCustomerData: () => void;
}

const STORAGE_KEY = 'loopnex_customer_portal_state_v1';

// Initial Mock Customer: ABC Traders
const INITIAL_PROFILE: CustomerProfile = {
  id: 'cust-abc-01',
  name: 'Eleanor Vance',
  email: 'billing@abctraders.in',
  phone: '+91 98765 43210',
  company: 'ABC Traders',
  address: 'Suite 402, Trade Hub Towers, MG Road, Bengaluru, Karnataka 560001',
  gstin: '29AABCU9603R1ZM',
  currency: 'INR',
  memberSince: 'January 2026',
};

const INITIAL_ADDONS: AddonItem[] = [
  {
    id: 'addon-1',
    name: 'Extra Cloud Storage (100GB)',
    description: 'High availability off-site encrypted backup & attachments archive',
    price: 100,
    isEnabled: true,
    category: 'storage',
  },
  {
    id: 'addon-2',
    name: 'Advanced Financial Reports',
    description: 'Custom cash-flow statements, dimensional P&L, and GST return exports',
    price: 200,
    isEnabled: true,
    category: 'reporting',
  },
  {
    id: 'addon-3',
    name: 'Additional Team Seats (+5)',
    description: 'Collaborative accountant & branch manager role clearances',
    price: 150,
    isEnabled: false,
    category: 'users',
  },
  {
    id: 'addon-4',
    name: '24/7 Priority Phone Support',
    description: 'Dedicated relationship manager and 15-minute response SLA',
    price: 300,
    isEnabled: false,
    category: 'support',
  },
  {
    id: 'addon-5',
    name: 'Multi-Currency Settlement',
    description: 'Real-time Forex currency revaluation and cross-border billing',
    price: 250,
    isEnabled: false,
    category: 'features',
  },
];

const INITIAL_PLANS: CustomerPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Monthly',
    description: 'Essential billing and client records for small micro-enterprises',
    price: 499,
    frequency: 'Monthly',
    features: ['Up to 2 active users', 'Standard invoice generation', 'Email support', '5GB cloud storage'],
    isCurrent: false,
  },
  {
    id: 'plan-pro',
    name: 'Professional Monthly',
    description: 'Comprehensive automation, inventory sync, and automated dunning',
    price: 1000,
    frequency: 'Monthly',
    features: [
      'Up to 10 active team seats',
      'Automated recurring billing',
      'Bank reconciliation feeds',
      'GST & Tax compliance reports',
      'Priority email & chat support',
    ],
    isCurrent: true,
    recommended: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Annual',
    description: 'High-volume ERP integrations, dedicated SLA, and custom audit trails',
    price: 2500,
    frequency: 'Monthly',
    features: [
      'Unlimited user seats',
      'Custom webhook triggers',
      'Dedicated revenue consultant',
      'Advanced forensic audit log',
      '99.95% uptime guarantee',
    ],
    isCurrent: false,
  },
];

const INITIAL_INVOICES: CustomerInvoice[] = [
  {
    id: 'inv-104',
    invoiceNumber: 'INV-2026-0104',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    productName: 'Accounting Software — Professional Monthly',
    status: 'Paid',
    lines: [
      { description: 'Professional Monthly Subscription Base', quantity: 1, unitPrice: 1000, amount: 1000 },
      { description: 'Add-on: Extra Cloud Storage (100GB)', quantity: 1, unitPrice: 100, amount: 100 },
      { description: 'Add-on: Advanced Financial Reports', quantity: 1, unitPrice: 200, amount: 200 },
    ],
    subtotal: 1300,
    discount: 0,
    taxRate: 18,
    taxTotal: 234,
    total: 1534,
    amountPaid: 1534,
    balanceDue: 0,
  },
  {
    id: 'inv-092',
    invoiceNumber: 'INV-2026-0092',
    issueDate: '2026-09-15',
    dueDate: '2026-09-30',
    productName: 'Accounting Software — Professional Monthly',
    status: 'Paid',
    lines: [
      { description: 'Professional Monthly Subscription Base', quantity: 1, unitPrice: 1000, amount: 1000 },
      { description: 'Add-on: Extra Cloud Storage (100GB)', quantity: 1, unitPrice: 100, amount: 100 },
      { description: 'Add-on: Advanced Financial Reports', quantity: 1, unitPrice: 200, amount: 200 },
    ],
    subtotal: 1300,
    discount: 0,
    taxRate: 18,
    taxTotal: 234,
    total: 1534,
    amountPaid: 1534,
    balanceDue: 0,
  },
  {
    id: 'inv-081',
    invoiceNumber: 'INV-2026-0081',
    issueDate: '2026-08-15',
    dueDate: '2026-08-30',
    productName: 'Accounting Software — Professional Monthly',
    status: 'Paid',
    lines: [
      { description: 'Professional Monthly Subscription Base', quantity: 1, unitPrice: 1000, amount: 1000 },
      { description: 'Add-on: Advanced Financial Reports', quantity: 1, unitPrice: 200, amount: 200 },
    ],
    subtotal: 1200,
    discount: 0,
    taxRate: 18,
    taxTotal: 216,
    total: 1416,
    amountPaid: 1416,
    balanceDue: 0,
  },
  {
    id: 'inv-068',
    invoiceNumber: 'INV-2026-0068',
    issueDate: '2026-07-15',
    dueDate: '2026-07-30',
    productName: 'Accounting Software — Professional Monthly',
    status: 'Paid',
    lines: [
      { description: 'Professional Monthly Subscription Base', quantity: 1, unitPrice: 1000, amount: 1000 },
      { description: 'Add-on: Advanced Financial Reports', quantity: 1, unitPrice: 200, amount: 200 },
    ],
    subtotal: 1200,
    discount: 0,
    taxRate: 18,
    taxTotal: 216,
    total: 1416,
    amountPaid: 1416,
    balanceDue: 0,
  },
];

const INITIAL_PAYMENTS: CustomerPayment[] = [
  {
    id: 'pay-9042',
    referenceNumber: 'PAY-2026-9042',
    invoiceNumber: 'INV-2026-0104',
    paymentDate: '2026-10-16',
    method: 'UPI (HDFC Bank)',
    amount: 1534,
    status: 'Completed',
  },
  {
    id: 'pay-8819',
    referenceNumber: 'PAY-2026-8819',
    invoiceNumber: 'INV-2026-0092',
    paymentDate: '2026-09-17',
    method: 'Credit Card (Visa •• 4129)',
    amount: 1534,
    status: 'Completed',
  },
  {
    id: 'pay-7640',
    referenceNumber: 'PAY-2026-7640',
    invoiceNumber: 'INV-2026-0081',
    paymentDate: '2026-08-16',
    method: 'Net Banking (ICICI Corporate)',
    amount: 1416,
    status: 'Completed',
  },
  {
    id: 'pay-6512',
    referenceNumber: 'PAY-2026-6512',
    invoiceNumber: 'INV-2026-0068',
    paymentDate: '2026-07-16',
    method: 'UPI (Google Pay)',
    amount: 1416,
    status: 'Completed',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-8021',
    ticketNumber: 'TICK-8021',
    subject: 'Setting up automated GST e-invoice webhook',
    category: 'Technical',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-10-22',
    message: 'Hello, we are configuring our ERP backend to consume the real-time invoice generation webhooks. Could you provide the sandbox endpoint?',
    response: 'Hello Eleanor, the endpoint and webhook signing secret have been dispatched to your technical contact. Let us know if you need any additional schema documentation.',
  },
  {
    id: 'tick-7910',
    ticketNumber: 'TICK-7910',
    subject: 'Reconciliation rule for multiple currency payments',
    category: 'Billing',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2026-09-10',
    message: 'Can we configure automated rules to map cross-border inward remittances to domestic invoices?',
    response: 'Yes, this is supported under the Multi-Currency Settlement add-on module. We have enabled a 7-day trial on your workspace.',
  },
];

const calculateSubscription = (basePrice: number, activeAddons: AddonItem[], planName: string, status: SubscriptionStatus): CustomerSubscription => {
  const addonsTotal = activeAddons.filter((a) => a.isEnabled).reduce((sum, a) => sum + a.price, 0);
  const subtotal = basePrice + addonsTotal;
  const taxRate = 18;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const totalAmount = subtotal + taxAmount;

  return {
    subscriptionNumber: 'SUB-2026-0812',
    productName: 'Accounting Software',
    planName,
    frequency: 'Monthly',
    startDate: '2026-01-15',
    expiryDate: '2026-11-28',
    nextBillingDate: '2026-11-28',
    paymentTerms: 'Net 15 Days',
    status,
    quantity: 1,
    basePrice,
    addonsTotal,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    autoRenew: true,
    addons: activeAddons,
  };
};

const CustomerDataContext = createContext<CustomerDataContextType | undefined>(undefined);

export const CustomerDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or defaults
  const [profile, setProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [addons, setAddons] = useState<AddonItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_addons`);
      return saved ? JSON.parse(saved) : INITIAL_ADDONS;
    } catch {
      return INITIAL_ADDONS;
    }
  });

  const [plans, setPlans] = useState<CustomerPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_plans`);
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [payments, setPayments] = useState<CustomerPayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tickets`);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('Active');

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Toast Helpers
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute Current Subscription
  const currentPlan = plans.find((p) => p.isCurrent) || plans[1];
  const subscription = calculateSubscription(currentPlan.price, addons, currentPlan.name, subscriptionStatus);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY}_addons`, JSON.stringify(addons));
      localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(plans));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_tickets`, JSON.stringify(tickets));
    } catch (err) {
      console.error('Failed to sync customer state to localStorage', err);
    }
  }, [profile, addons, plans, invoices, payments, tickets]);

  // Actions
  const updateProfile = useCallback((data: Partial<CustomerProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    showToast('Profile information successfully updated', 'success');
  }, [showToast]);

  const toggleAddon = useCallback((addonId: string) => {
    setAddons((prev) =>
      prev.map((a) => {
        if (a.id === addonId) {
          const nextState = !a.isEnabled;
          showToast(
            nextState
              ? `Added "${a.name}" (+₹${a.price}/mo) to next billing cycle`
              : `Removed "${a.name}" from your active add-ons`,
            'info'
          );
          return { ...a, isEnabled: nextState };
        }
        return a;
      })
    );
  }, [showToast]);

  const changePlan = useCallback((planId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        const isSelected = p.id === planId;
        if (isSelected) {
          showToast(`Successfully switched to "${p.name}" (₹${p.price.toLocaleString()}/mo)`, 'success');
        }
        return { ...p, isCurrent: isSelected };
      })
    );
  }, [showToast]);

  const requestCancellation = useCallback((reason: string) => {
    setSubscriptionStatus('Closed');
    showToast(`Cancellation scheduled for end of cycle. Reason: "${reason.slice(0, 30)}..."`, 'info');
  }, [showToast]);

  const requestRenewal = useCallback(() => {
    setSubscriptionStatus('Active');
    showToast('Subscription renewal confirmed. Auto-debit scheduled for next cycle.', 'success');
  }, [showToast]);

  const togglePauseResumeSubscription = useCallback(() => {
    setSubscriptionStatus((prev) => {
      const next = prev === 'Active' ? 'Paused' : 'Active';
      showToast(
        next === 'Paused'
          ? 'Subscription paused. Services remain active until cycle end.'
          : 'Subscription resumed to active status.',
        'info'
      );
      return next;
    });
  }, [showToast]);

  const createSupportTicket = useCallback((ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      id: `tick-${Date.now()}`,
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Open',
      ...ticketData,
    };
    setTickets((prev) => [newTicket, ...prev]);
    showToast(`Support request #${newTicket.ticketNumber} submitted successfully`, 'success');
  }, [showToast]);

  const downloadInvoicePDF = useCallback((invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    showToast(`Generating printable statement for ${inv?.invoiceNumber || 'Invoice'}...`, 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  }, [invoices, showToast]);

  const resetCustomerData = useCallback(() => {
    setProfile(INITIAL_PROFILE);
    setAddons(INITIAL_ADDONS);
    setPlans(INITIAL_PLANS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setTickets(INITIAL_TICKETS);
    setSubscriptionStatus('Active');
    localStorage.removeItem(`${STORAGE_KEY}_profile`);
    localStorage.removeItem(`${STORAGE_KEY}_addons`);
    localStorage.removeItem(`${STORAGE_KEY}_plans`);
    localStorage.removeItem(`${STORAGE_KEY}_invoices`);
    localStorage.removeItem(`${STORAGE_KEY}_payments`);
    localStorage.removeItem(`${STORAGE_KEY}_tickets`);
    showToast('Customer workspace reset to sample defaults', 'info');
  }, [showToast]);

  return (
    <CustomerDataContext.Provider
      value={{
        profile,
        subscription,
        plans,
        addons,
        invoices,
        payments,
        tickets,
        toasts,
        showToast,
        dismissToast,
        updateProfile,
        toggleAddon,
        changePlan,
        requestCancellation,
        requestRenewal,
        togglePauseResumeSubscription,
        createSupportTicket,
        downloadInvoicePDF,
        resetCustomerData,
      }}
    >
      {children}
    </CustomerDataContext.Provider>
  );
};

export const useCustomerData = () => {
  const context = useContext(CustomerDataContext);
  if (!context) {
    throw new Error('useCustomerData must be used within a CustomerDataProvider');
  }
  return context;
};
