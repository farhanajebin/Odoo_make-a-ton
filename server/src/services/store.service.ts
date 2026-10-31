import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from './prisma.js';

export interface RoleData {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'INVITED';
  roleId: string;
  role: RoleData;
  department?: string | null;
  phone?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByToken?: string | null;
  createdAt: Date;
}

export interface AuditLogData {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// In-Memory Fallback State (Active whenever PostgreSQL is not connected)
// -----------------------------------------------------------------------------
const MEMORY_ROLES: RoleData[] = [
  {
    id: 'role_admin_01',
    name: 'ADMIN',
    description: 'System Administrator with full system control and staff management',
    permissions: ['admin:all', 'staff:manage', 'audit:view', 'settings:manage'],
  },
  {
    id: 'role_staff_01',
    name: 'STAFF',
    description: 'Operational Revenue Operations Staff with operational and customer view access',
    permissions: ['staff:operational', 'customers:read', 'invoices:read', 'renewals:read'],
  },
  {
    id: 'role_customer_01',
    name: 'CUSTOMER',
    description: 'Subscribed Customer with access strictly limited to own account resources',
    permissions: ['customer:own_records', 'profile:update_own'],
  },
];

const MEMORY_USERS: UserData[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@loopnex.io',
    passwordHash: bcrypt.hashSync('Loopnex@Admin2026!', 10),
    fullName: 'Alex Drake',
    firstName: 'Alex',
    lastName: 'Drake',
    isActive: true,
    status: 'ACTIVE',
    roleId: 'role_admin_01',
    role: MEMORY_ROLES[0],
    department: 'EXECUTIVE',
    phone: '+1 (555) 019-2834',
    lastLoginAt: new Date(),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date(),
  },
  {
    id: 'usr_staff_01',
    email: 'staff@loopnex.io',
    passwordHash: bcrypt.hashSync('Loopnex@Staff2026!', 10),
    fullName: 'Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    isActive: true,
    status: 'ACTIVE',
    roleId: 'role_staff_01',
    role: MEMORY_ROLES[1],
    department: 'OPERATIONS',
    phone: '+1 (555) 014-9921',
    lastLoginAt: new Date(),
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
    updatedAt: new Date(),
  },
  {
    id: 'usr_customer_01',
    email: 'customer@loopnex.io',
    passwordHash: bcrypt.hashSync('Loopnex@Customer2026!', 10),
    fullName: 'Elena Rostova',
    firstName: 'Elena',
    lastName: 'Rostova',
    isActive: true,
    status: 'ACTIVE',
    roleId: 'role_customer_01',
    role: MEMORY_ROLES[2],
    phone: '+1 (555) 082-1133',
    lastLoginAt: new Date(),
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date(),
  },
];

const MEMORY_RESET_TOKENS: PasswordResetTokenData[] = [];
const MEMORY_REFRESH_TOKENS: RefreshTokenData[] = [];
const MEMORY_AUDIT_LOGS: AuditLogData[] = [];

export interface CustomerOperationalData {
  id: string;
  legalName: string;
  tradingName?: string | null;
  email: string;
  phone?: string | null;
  company: string;
  customerType: 'ENTERPRISE' | 'MID_MARKET' | 'STARTUP';
  activeSubscriptions: number;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  assignedStaff?: string | null;
  address?: string | null;
  createdAt: Date;
}

export interface QuotationOperationalData {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  product: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil: Date;
  createdAt: Date;
  notes?: string | null;
}

export interface SubscriptionOperationalData {
  id: string;
  subNumber: string;
  customerId: string;
  customerName: string;
  product: string;
  variant: string;
  plan: string;
  cadence: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  status: 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'CLOSED';
  addOns: string[];
}

export interface InvoiceOperationalData {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionId?: string | null;
  subNumber?: string | null;
  issuedAt: Date;
  dueDate: Date;
  subtotal: number;
  taxTotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
  lines: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

export interface PaymentOperationalData {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  method: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD';
  paymentDate: Date;
  amount: number;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
  notes?: string | null;
}

// -----------------------------------------------------------------------------
// Operational Fallback In-Memory State
// -----------------------------------------------------------------------------
const MEMORY_CUSTOMERS: CustomerOperationalData[] = [
  {
    id: 'cust_01',
    legalName: 'Acme Global Technologies LLC',
    tradingName: 'Acme Global',
    email: 'sarah.c@acme.io',
    phone: '+1 (555) 234-5678',
    company: 'Acme Corp',
    customerType: 'ENTERPRISE',
    activeSubscriptions: 3,
    status: 'ACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '100 Market St, Suite 400, San Francisco, CA 94105',
    createdAt: new Date('2026-01-10T10:00:00Z'),
  },
  {
    id: 'cust_02',
    legalName: 'Synthetix Dynamics Corp',
    tradingName: 'Synthetix AI',
    email: 'david.m@synthetix.com',
    phone: '+1 (555) 345-6789',
    company: 'Synthetix Dynamics',
    customerType: 'ENTERPRISE',
    activeSubscriptions: 2,
    status: 'ACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '450 5th Ave, Floor 18, New York, NY 10018',
    createdAt: new Date('2026-01-20T11:30:00Z'),
  },
  {
    id: 'cust_03',
    legalName: 'Vanguard Biometrics Inc',
    tradingName: 'Vanguard Bio',
    email: 'alicia.w@vanguard.org',
    phone: '+1 (555) 456-7890',
    company: 'Vanguard Biometrics',
    customerType: 'MID_MARKET',
    activeSubscriptions: 1,
    status: 'ACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '782 Kendall Sq, Cambridge, MA 02142',
    createdAt: new Date('2026-02-15T09:15:00Z'),
  },
  {
    id: 'cust_04',
    legalName: 'Oasis Cloud Infrastructure Ltd',
    tradingName: 'Oasis Cloud',
    email: 'mark.k@oasis.net',
    phone: '+1 (555) 567-8901',
    company: 'Oasis Cloud',
    customerType: 'ENTERPRISE',
    activeSubscriptions: 4,
    status: 'ACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '1200 6th Ave, Seattle, WA 98101',
    createdAt: new Date('2025-11-01T14:00:00Z'),
  },
  {
    id: 'cust_05',
    legalName: 'Apex Logistics International',
    tradingName: 'Apex Global',
    email: 'carol.t@apexlogistics.com',
    phone: '+1 (555) 678-9012',
    company: 'Apex Logistics',
    customerType: 'MID_MARKET',
    activeSubscriptions: 2,
    status: 'ACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '300 Michigan Ave, Chicago, IL 60601',
    createdAt: new Date('2026-03-05T16:20:00Z'),
  },
  {
    id: 'cust_06',
    legalName: 'Quantum Labs Computing Inc',
    tradingName: 'Quantum Labs',
    email: 'james.r@quantumlabs.tech',
    phone: '+1 (555) 789-0123',
    company: 'Quantum Labs',
    customerType: 'STARTUP',
    activeSubscriptions: 1,
    status: 'PENDING',
    assignedStaff: 'Sarah Jenkins',
    address: '550 University Ave, Palo Alto, CA 94301',
    createdAt: new Date('2026-04-12T13:45:00Z'),
  },
  {
    id: 'cust_07',
    legalName: 'Nexa Robotics AI Systems',
    tradingName: 'Nexa AI',
    email: 'priya.s@nexarobotics.io',
    phone: '+1 (555) 890-1234',
    company: 'Nexa Robotics',
    customerType: 'STARTUP',
    activeSubscriptions: 1,
    status: 'ACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '89 Austin Blvd, Austin, TX 78701',
    createdAt: new Date('2026-05-18T10:30:00Z'),
  },
  {
    id: 'cust_08',
    legalName: 'Vertex Media Global Inc',
    tradingName: 'Vertex Media',
    email: 'jordan.b@vertexmedia.co',
    phone: '+1 (555) 901-2345',
    company: 'Vertex Media',
    customerType: 'MID_MARKET',
    activeSubscriptions: 0,
    status: 'INACTIVE',
    assignedStaff: 'Sarah Jenkins',
    address: '250 Broadway, New York, NY 10007',
    createdAt: new Date('2026-02-01T15:00:00Z'),
  },
];

const MEMORY_QUOTATIONS: QuotationOperationalData[] = [
  {
    id: 'qt_01',
    quoteNumber: 'QT-2026-081',
    customerId: 'cust_01',
    customerName: 'Acme Global Technologies LLC',
    customerEmail: 'sarah.c@acme.io',
    product: 'LoopNex Enterprise Engine',
    variant: 'Dedicated Cluster (HA)',
    quantity: 1,
    unitPrice: 14500,
    subtotal: 14500,
    taxRate: 8.25,
    taxTotal: 1155,
    discount: 500,
    total: 15155,
    status: 'DRAFT',
    validUntil: new Date('2026-11-20T23:59:59Z'),
    createdAt: new Date('2026-10-25T11:00:00Z'),
    notes: 'Net-30 billing cycle with priority onboarding included.',
  },
  {
    id: 'qt_02',
    quoteNumber: 'QT-2026-082',
    customerId: 'cust_02',
    customerName: 'Synthetix Dynamics Corp',
    customerEmail: 'david.m@synthetix.com',
    product: 'LoopNex Scale Engine',
    variant: 'Multi-Region High Throughput',
    quantity: 2,
    unitPrice: 4800,
    subtotal: 9600,
    taxRate: 8.25,
    taxTotal: 792,
    discount: 0,
    total: 10392,
    status: 'SENT',
    validUntil: new Date('2026-11-25T23:59:59Z'),
    createdAt: new Date('2026-10-28T09:30:00Z'),
    notes: 'Q4 expansion proposal submitted for review.',
  },
  {
    id: 'qt_03',
    quoteNumber: 'QT-2026-083',
    customerId: 'cust_06',
    customerName: 'Quantum Labs Computing Inc',
    customerEmail: 'james.r@quantumlabs.tech',
    product: 'LoopNex Growth Suite',
    variant: 'Standard Cloud Tier',
    quantity: 1,
    unitPrice: 1200,
    subtotal: 1200,
    taxRate: 8.25,
    taxTotal: 90.75,
    discount: 100,
    total: 1190.75,
    status: 'ACCEPTED',
    validUntil: new Date('2026-11-15T23:59:59Z'),
    createdAt: new Date('2026-10-20T14:15:00Z'),
    notes: 'Customer accepted digital terms on 2026-10-29.',
  },
  {
    id: 'qt_04',
    quoteNumber: 'QT-2026-084',
    customerId: 'cust_03',
    customerName: 'Vanguard Biometrics Inc',
    customerEmail: 'alicia.w@vanguard.org',
    product: 'Compliance Telemetry Module',
    variant: 'HIPAA & SOC2 Audit Stream',
    quantity: 1,
    unitPrice: 3500,
    subtotal: 3500,
    taxRate: 8.25,
    taxTotal: 288.75,
    discount: 0,
    total: 3788.75,
    status: 'SENT',
    validUntil: new Date('2026-11-18T23:59:59Z'),
    createdAt: new Date('2026-10-26T16:45:00Z'),
    notes: 'Awaiting procurement approval.',
  },
  {
    id: 'qt_05',
    quoteNumber: 'QT-2026-085',
    customerId: 'cust_08',
    customerName: 'Vertex Media Global Inc',
    customerEmail: 'jordan.b@vertexmedia.co',
    product: 'LoopNex Scale Engine',
    variant: 'Annual Enterprise SKU',
    quantity: 1,
    unitPrice: 9600,
    subtotal: 9600,
    taxRate: 8.25,
    taxTotal: 709.5,
    discount: 1000,
    total: 9309.5,
    status: 'EXPIRED',
    validUntil: new Date('2026-10-15T23:59:59Z'),
    createdAt: new Date('2026-09-15T12:00:00Z'),
    notes: 'Expired without customer signature.',
  },
];

const MEMORY_SUBSCRIPTIONS: SubscriptionOperationalData[] = [
  {
    id: 'sub_01',
    subNumber: 'SUB-4821',
    customerId: 'cust_01',
    customerName: 'Acme Global Technologies LLC',
    product: 'LoopNex Core Platform',
    variant: 'Enterprise Dedicated',
    plan: 'Enterprise Annual',
    cadence: 'ANNUAL',
    startedAt: new Date('2026-01-15T00:00:00Z'),
    currentPeriodStart: new Date('2026-01-15T00:00:00Z'),
    currentPeriodEnd: new Date('2027-01-15T00:00:00Z'),
    amount: 48000,
    status: 'ACTIVE',
    addOns: ['24/7 Dedicated TAM', 'Custom Webhooks', 'Audit Archive'],
  },
  {
    id: 'sub_02',
    subNumber: 'SUB-4822',
    customerId: 'cust_02',
    customerName: 'Synthetix Dynamics Corp',
    product: 'LoopNex Scale Engine',
    variant: 'Multi-Region Cluster',
    plan: 'Scale Quarterly',
    cadence: 'QUARTERLY',
    startedAt: new Date('2026-04-01T00:00:00Z'),
    currentPeriodStart: new Date('2026-10-01T00:00:00Z'),
    currentPeriodEnd: new Date('2027-01-01T00:00:00Z'),
    amount: 14400,
    status: 'ACTIVE',
    addOns: ['High Throughput Burst', 'SLA 99.99%'],
  },
  {
    id: 'sub_03',
    subNumber: 'SUB-4823',
    customerId: 'cust_03',
    customerName: 'Vanguard Biometrics Inc',
    product: 'LoopNex Growth',
    variant: 'Standard Cloud Tier',
    plan: 'Growth Monthly',
    cadence: 'MONTHLY',
    startedAt: new Date('2026-06-10T00:00:00Z'),
    currentPeriodStart: new Date('2026-10-10T00:00:00Z'),
    currentPeriodEnd: new Date('2026-11-10T00:00:00Z'),
    amount: 2400,
    status: 'ACTIVE',
    addOns: ['SOC2 Compliance Logs'],
  },
  {
    id: 'sub_04',
    subNumber: 'SUB-4824',
    customerId: 'cust_04',
    customerName: 'Oasis Cloud Infrastructure Ltd',
    product: 'LoopNex Enterprise',
    variant: 'Private Cloud VPC',
    plan: 'Enterprise Annual',
    cadence: 'ANNUAL',
    startedAt: new Date('2025-11-05T00:00:00Z'),
    currentPeriodStart: new Date('2025-11-05T00:00:00Z'),
    currentPeriodEnd: new Date('2026-11-05T00:00:00Z'),
    amount: 36000,
    status: 'ACTIVE',
    addOns: ['Dedicated Database Replicas', 'Custom SSO'],
  },
  {
    id: 'sub_05',
    subNumber: 'SUB-4825',
    customerId: 'cust_05',
    customerName: 'Apex Logistics International',
    product: 'LoopNex Scale Engine',
    variant: 'API Metered Gateway',
    plan: 'Scale Monthly',
    cadence: 'MONTHLY',
    startedAt: new Date('2026-08-01T00:00:00Z'),
    currentPeriodStart: new Date('2026-10-01T00:00:00Z'),
    currentPeriodEnd: new Date('2026-11-01T00:00:00Z'),
    amount: 3800,
    status: 'ACTIVE',
    addOns: ['Fleet Telemetry Integration'],
  },
  {
    id: 'sub_06',
    subNumber: 'SUB-4826',
    customerId: 'cust_07',
    customerName: 'Nexa Robotics AI Systems',
    product: 'LoopNex Starter',
    variant: 'Cloud Developer',
    plan: 'Starter Monthly',
    cadence: 'MONTHLY',
    startedAt: new Date('2026-09-15T00:00:00Z'),
    currentPeriodStart: new Date('2026-10-15T00:00:00Z'),
    currentPeriodEnd: new Date('2026-11-15T00:00:00Z'),
    amount: 950,
    status: 'ACTIVE',
    addOns: [],
  },
  {
    id: 'sub_07',
    subNumber: 'SUB-4827',
    customerId: 'cust_08',
    customerName: 'Vertex Media Global Inc',
    product: 'LoopNex Growth',
    variant: 'Media CDN Bundle',
    plan: 'Growth Monthly',
    cadence: 'MONTHLY',
    startedAt: new Date('2026-03-01T00:00:00Z'),
    currentPeriodStart: new Date('2026-08-01T00:00:00Z'),
    currentPeriodEnd: new Date('2026-09-01T00:00:00Z'),
    amount: 2400,
    status: 'CLOSED',
    addOns: [],
  },
];

const MEMORY_INVOICES: InvoiceOperationalData[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-2026-101',
    customerId: 'cust_01',
    customerName: 'Acme Global Technologies LLC',
    customerEmail: 'sarah.c@acme.io',
    subscriptionId: 'sub_01',
    subNumber: 'SUB-4821',
    issuedAt: new Date('2026-01-15T00:00:00Z'),
    dueDate: new Date('2026-02-14T00:00:00Z'),
    subtotal: 44341.8,
    taxTotal: 3658.2,
    discount: 0,
    total: 48000,
    amountPaid: 48000,
    balanceDue: 0,
    status: 'PAID',
    lines: [
      { description: 'LoopNex Enterprise Platform (Annual)', quantity: 1, unitPrice: 44341.8, total: 44341.8 },
    ],
  },
  {
    id: 'inv_02',
    invoiceNumber: 'INV-2026-102',
    customerId: 'cust_02',
    customerName: 'Synthetix Dynamics Corp',
    customerEmail: 'david.m@synthetix.com',
    subscriptionId: 'sub_02',
    subNumber: 'SUB-4822',
    issuedAt: new Date('2026-10-01T00:00:00Z'),
    dueDate: new Date('2026-10-31T00:00:00Z'),
    subtotal: 13302.54,
    taxTotal: 1097.46,
    discount: 0,
    total: 14400,
    amountPaid: 14400,
    balanceDue: 0,
    status: 'PAID',
    lines: [
      { description: 'Scale Engine Cluster Q4 Cadence', quantity: 1, unitPrice: 13302.54, total: 13302.54 },
    ],
  },
  {
    id: 'inv_03',
    invoiceNumber: 'INV-2026-103',
    customerId: 'cust_03',
    customerName: 'Vanguard Biometrics Inc',
    customerEmail: 'alicia.w@vanguard.org',
    subscriptionId: 'sub_03',
    subNumber: 'SUB-4823',
    issuedAt: new Date('2026-10-10T00:00:00Z'),
    dueDate: new Date('2026-11-09T00:00:00Z'),
    subtotal: 2217.09,
    taxTotal: 182.91,
    discount: 0,
    total: 2400,
    amountPaid: 0,
    balanceDue: 2400,
    status: 'CONFIRMED',
    lines: [
      { description: 'Growth Tier Monthly License (Oct 10 - Nov 10)', quantity: 1, unitPrice: 2217.09, total: 2217.09 },
    ],
  },
  {
    id: 'inv_04',
    invoiceNumber: 'INV-2026-104',
    customerId: 'cust_04',
    customerName: 'Oasis Cloud Infrastructure Ltd',
    customerEmail: 'mark.k@oasis.net',
    subscriptionId: 'sub_04',
    subNumber: 'SUB-4824',
    issuedAt: new Date('2026-10-05T00:00:00Z'),
    dueDate: new Date('2026-10-25T00:00:00Z'),
    subtotal: 33256.35,
    taxTotal: 2743.65,
    discount: 0,
    total: 36000,
    amountPaid: 18000,
    balanceDue: 18000,
    status: 'PARTIALLY_PAID',
    lines: [
      { description: 'Private Cloud VPC License (Nov 2025 - Nov 2026)', quantity: 1, unitPrice: 33256.35, total: 33256.35 },
    ],
  },
  {
    id: 'inv_05',
    invoiceNumber: 'INV-2026-105',
    customerId: 'cust_05',
    customerName: 'Apex Logistics International',
    customerEmail: 'carol.t@apexlogistics.com',
    subscriptionId: 'sub_05',
    subNumber: 'SUB-4825',
    issuedAt: new Date('2026-09-01T00:00:00Z'),
    dueDate: new Date('2026-09-25T00:00:00Z'),
    subtotal: 3510.39,
    taxTotal: 289.61,
    discount: 0,
    total: 3800,
    amountPaid: 0,
    balanceDue: 3800,
    status: 'OVERDUE',
    lines: [
      { description: 'API Metered Gateway Cadence', quantity: 1, unitPrice: 3510.39, total: 3510.39 },
    ],
  },
  {
    id: 'inv_06',
    invoiceNumber: 'INV-2026-106',
    customerId: 'cust_07',
    customerName: 'Nexa Robotics AI Systems',
    customerEmail: 'priya.s@nexarobotics.io',
    subscriptionId: 'sub_06',
    subNumber: 'SUB-4826',
    issuedAt: new Date('2026-10-15T00:00:00Z'),
    dueDate: new Date('2026-11-14T00:00:00Z'),
    subtotal: 877.6,
    taxTotal: 72.4,
    discount: 0,
    total: 950,
    amountPaid: 950,
    balanceDue: 0,
    status: 'PAID',
    lines: [
      { description: 'Starter Monthly Cloud (Oct 15 - Nov 15)', quantity: 1, unitPrice: 877.6, total: 877.6 },
    ],
  },
  {
    id: 'inv_07',
    invoiceNumber: 'INV-2026-107',
    customerId: 'cust_06',
    customerName: 'Quantum Labs Computing Inc',
    customerEmail: 'james.r@quantumlabs.tech',
    subscriptionId: null,
    subNumber: null,
    issuedAt: new Date('2026-10-28T00:00:00Z'),
    dueDate: new Date('2026-11-20T00:00:00Z'),
    subtotal: 1100,
    taxTotal: 90.75,
    discount: 0,
    total: 1190.75,
    amountPaid: 0,
    balanceDue: 1190.75,
    status: 'DRAFT',
    lines: [
      { description: 'Initial Onboarding & Growth Cloud Plan', quantity: 1, unitPrice: 1100, total: 1100 },
    ],
  },
];

const MEMORY_PAYMENTS: PaymentOperationalData[] = [
  {
    id: 'pay_01',
    reference: 'WIRE-ACH-889124',
    customerId: 'cust_01',
    customerName: 'Acme Global Technologies LLC',
    invoiceId: 'inv_01',
    invoiceNumber: 'INV-2026-101',
    method: 'BANK_TRANSFER',
    paymentDate: new Date('2026-01-20T14:30:00Z'),
    amount: 48000,
    status: 'SUCCEEDED',
    notes: 'Direct corporate wire settlement verified.',
  },
  {
    id: 'pay_02',
    reference: 'STRIPE-CH-382914',
    customerId: 'cust_02',
    customerName: 'Synthetix Dynamics Corp',
    invoiceId: 'inv_02',
    invoiceNumber: 'INV-2026-102',
    method: 'CARD',
    paymentDate: new Date('2026-10-05T09:12:00Z'),
    amount: 14400,
    status: 'SUCCEEDED',
    notes: 'Auto-debit corporate credit card transaction.',
  },
  {
    id: 'pay_03',
    reference: 'FEDWIRE-TX-55190',
    customerId: 'cust_04',
    customerName: 'Oasis Cloud Infrastructure Ltd',
    invoiceId: 'inv_04',
    invoiceNumber: 'INV-2026-104',
    method: 'BANK_TRANSFER',
    paymentDate: new Date('2026-10-12T16:00:00Z'),
    amount: 18000,
    status: 'SUCCEEDED',
    notes: 'Tranche 1 of 2 received.',
  },
  {
    id: 'pay_04',
    reference: 'UPI-NEXA-992104@oksbi',
    customerId: 'cust_07',
    customerName: 'Nexa Robotics AI Systems',
    invoiceId: 'inv_06',
    invoiceNumber: 'INV-2026-106',
    method: 'UPI',
    paymentDate: new Date('2026-10-16T11:45:00Z'),
    amount: 950,
    status: 'SUCCEEDED',
    notes: 'Instant merchant UPI clearance.',
  },
  {
    id: 'pay_05',
    reference: 'REC-CASH-00219',
    customerId: 'cust_05',
    customerName: 'Apex Logistics International',
    invoiceId: 'inv_05',
    invoiceNumber: 'INV-2026-105',
    method: 'CASH',
    paymentDate: new Date('2026-08-15T15:20:00Z'),
    amount: 3800,
    status: 'SUCCEEDED',
    notes: 'Prior period cash settlement.',
  },
];

class StoreService {
  private isPrismaHealthy: boolean | null = null;
  private lastHealthCheck = 0;

  private async checkPrisma(): Promise<boolean> {
    const prisma = getPrismaClient();
    if (!prisma) return false;

    const now = Date.now();
    if (this.isPrismaHealthy === false && now - this.lastHealthCheck < 15000) {
      return false;
    }

    try {
      this.lastHealthCheck = now;
      await prisma.$queryRaw`SELECT 1`;
      this.isPrismaHealthy = true;
      return true;
    } catch {
      this.isPrismaHealthy = false;
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Role Operations
  // ---------------------------------------------------------------------------
  async findRoleByName(name: string): Promise<RoleData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const role = await prisma.role.findUnique({ where: { name: name.toUpperCase() } });
      if (role) {
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: (role.permissions as string[]) || [],
        };
      }
    }
    const found = MEMORY_ROLES.find((r) => r.name.toUpperCase() === name.toUpperCase());
    return found ? { ...found } : null;
  }

  async findRoleById(id: string): Promise<RoleData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const role = await prisma.role.findUnique({ where: { id } });
      if (role) {
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: (role.permissions as string[]) || [],
        };
      }
    }
    const found = MEMORY_ROLES.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  // ---------------------------------------------------------------------------
  // User Operations
  // ---------------------------------------------------------------------------
  async findUserByEmail(email: string): Promise<UserData | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { role: true, staffProfile: true },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          status: user.status as UserData['status'],
          roleId: user.roleId,
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            permissions: (user.role.permissions as string[]) || [],
          },
          department: user.staffProfile?.department || null,
          phone: user.staffProfile?.phone || null,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }
    const found = MEMORY_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
    return found ? { ...found } : null;
  }

  async findUserById(id: string): Promise<UserData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { role: true, staffProfile: true },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          status: user.status as UserData['status'],
          roleId: user.roleId,
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            permissions: (user.role.permissions as string[]) || [],
          },
          department: user.staffProfile?.department || null,
          phone: user.staffProfile?.phone || null,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }
    const found = MEMORY_USERS.find((u) => u.id === id);
    return found ? { ...found } : null;
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: string;
    department?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<UserData> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const role = (await this.findRoleById(data.roleId)) || MEMORY_ROLES[2];
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const created = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          firstName,
          lastName,
          roleId: role.id,
          isActive: data.isActive ?? true,
          status: (data.isActive ?? true) ? 'ACTIVE' : 'INACTIVE',
          ...(role.name === 'STAFF'
            ? {
                staffProfile: {
                  create: {
                    title: 'Revenue Operations Specialist',
                    department: (data.department as any) || 'OPERATIONS',
                    phone: data.phone,
                  },
                },
              }
            : {}),
        },
        include: { role: true, staffProfile: true },
      });

      return {
        id: created.id,
        email: created.email,
        passwordHash: created.passwordHash,
        fullName: created.fullName || data.fullName,
        firstName: created.firstName,
        lastName: created.lastName,
        isActive: created.isActive,
        status: created.status as UserData['status'],
        roleId: created.roleId,
        role: {
          id: created.role.id,
          name: created.role.name,
          description: created.role.description,
          permissions: (created.role.permissions as string[]) || [],
        },
        department: created.staffProfile?.department || data.department || null,
        phone: created.staffProfile?.phone || data.phone || null,
        lastLoginAt: created.lastLoginAt,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    }

    const newUser: UserData = {
      id: `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      firstName,
      lastName,
      isActive: data.isActive ?? true,
      status: (data.isActive ?? true) ? 'ACTIVE' : 'INACTIVE',
      roleId: role.id,
      role,
      department: data.department || null,
      phone: data.phone || null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MEMORY_USERS.push(newUser);
    return { ...newUser };
  }

  async updateUser(
    id: string,
    data: Partial<{
      fullName: string;
      passwordHash: string;
      isActive: boolean;
      status: UserData['status'];
      department: string | null;
      phone: string | null;
      lastLoginAt: Date;
    }>
  ): Promise<UserData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
          ...(data.isActive !== undefined && {
            isActive: data.isActive,
            status: data.isActive ? 'ACTIVE' : 'INACTIVE',
          }),
          ...(data.status !== undefined && { status: data.status as any }),
          ...(data.lastLoginAt !== undefined && { lastLoginAt: data.lastLoginAt }),
        },
        include: { role: true, staffProfile: true },
      });

      return {
        id: updated.id,
        email: updated.email,
        passwordHash: updated.passwordHash,
        fullName: updated.fullName || `${updated.firstName} ${updated.lastName}`.trim(),
        firstName: updated.firstName,
        lastName: updated.lastName,
        isActive: updated.isActive,
        status: updated.status as UserData['status'],
        roleId: updated.roleId,
        role: {
          id: updated.role.id,
          name: updated.role.name,
          description: updated.role.description,
          permissions: (updated.role.permissions as string[]) || [],
        },
        department: updated.staffProfile?.department || null,
        phone: updated.staffProfile?.phone || null,
        lastLoginAt: updated.lastLoginAt,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }

    const index = MEMORY_USERS.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const current = MEMORY_USERS[index];
    const updated: UserData = {
      ...current,
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive,
        status: data.isActive ? 'ACTIVE' : 'INACTIVE',
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.lastLoginAt !== undefined && { lastLoginAt: data.lastLoginAt }),
      updatedAt: new Date(),
    };
    MEMORY_USERS[index] = updated;
    return { ...updated };
  }

  async countActiveAdmins(): Promise<number> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      return await prisma.user.count({
        where: {
          role: { name: 'ADMIN' },
          isActive: true,
        },
      });
    }
    return MEMORY_USERS.filter((u) => u.role.name === 'ADMIN' && u.isActive).length;
  }

  async listStaff(searchQuery?: string): Promise<UserData[]> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const users = await prisma.user.findMany({
        where: {
          role: { name: 'STAFF' },
          ...(searchQuery
            ? {
                OR: [
                  { fullName: { contains: searchQuery, mode: 'insensitive' } },
                  { email: { contains: searchQuery, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: { role: true, staffProfile: true },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => ({
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        fullName: u.fullName || `${u.firstName} ${u.lastName}`.trim(),
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        status: u.status as UserData['status'],
        roleId: u.roleId,
        role: {
          id: u.role.id,
          name: u.role.name,
          description: u.role.description,
          permissions: (u.role.permissions as string[]) || [],
        },
        department: u.staffProfile?.department || 'OPERATIONS',
        phone: u.staffProfile?.phone || null,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    }

    let staff = MEMORY_USERS.filter((u) => u.role.name === 'STAFF');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      staff = staff.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return staff.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((u) => ({ ...u }));
  }

  // ---------------------------------------------------------------------------
  // Password Reset Token Operations
  // ---------------------------------------------------------------------------
  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenData> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.passwordResetToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      return {
        id: record.id,
        userId: record.userId,
        tokenHash: record.tokenHash,
        expiresAt: record.expiresAt,
        usedAt: record.usedAt,
        createdAt: record.createdAt,
      };
    }

    const tokenRecord: PasswordResetTokenData = {
      id: `prt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    MEMORY_RESET_TOKENS.push(tokenRecord);
    return { ...tokenRecord };
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });
      if (record) {
        return {
          id: record.id,
          userId: record.userId,
          tokenHash: record.tokenHash,
          expiresAt: record.expiresAt,
          usedAt: record.usedAt,
          createdAt: record.createdAt,
        };
      }
      return null;
    }

    const found = MEMORY_RESET_TOKENS.find((t) => t.tokenHash === tokenHash);
    return found ? { ...found } : null;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      await prisma.passwordResetToken.update({
        where: { id },
        data: { usedAt: new Date() },
      });
      return;
    }

    const item = MEMORY_RESET_TOKENS.find((t) => t.id === id);
    if (item) {
      item.usedAt = new Date();
    }
  }

  // ---------------------------------------------------------------------------
  // Refresh Token Operations
  // ---------------------------------------------------------------------------
  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenData> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      return {
        id: record.id,
        userId: record.userId,
        tokenHash: record.tokenHash,
        expiresAt: record.expiresAt,
        revokedAt: record.revokedAt,
        replacedByToken: record.replacedByToken,
        createdAt: record.createdAt,
      };
    }

    const tokenRecord: RefreshTokenData = {
      id: `rft_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      userId,
      tokenHash,
      expiresAt,
      revokedAt: null,
      replacedByToken: null,
      createdAt: new Date(),
    };
    MEMORY_REFRESH_TOKENS.push(tokenRecord);
    return { ...tokenRecord };
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenData | null> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const record = await prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      if (record) {
        return {
          id: record.id,
          userId: record.userId,
          tokenHash: record.tokenHash,
          expiresAt: record.expiresAt,
          revokedAt: record.revokedAt,
          replacedByToken: record.replacedByToken,
          createdAt: record.createdAt,
        };
      }
      return null;
    }

    const found = MEMORY_REFRESH_TOKENS.find((t) => t.tokenHash === tokenHash);
    return found ? { ...found } : null;
  }

  async revokeRefreshToken(id: string, replacedByToken?: string): Promise<void> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      await prisma.refreshToken.update({
        where: { id },
        data: {
          revokedAt: new Date(),
          ...(replacedByToken && { replacedByToken }),
        },
      });
      return;
    }

    const item = MEMORY_REFRESH_TOKENS.find((t) => t.id === id);
    if (item) {
      item.revokedAt = new Date();
      if (replacedByToken) {
        item.replacedByToken = replacedByToken;
      }
    }
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }

    MEMORY_REFRESH_TOKENS.forEach((t) => {
      if (t.userId === userId && !t.revokedAt) {
        t.revokedAt = new Date();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Audit Log Operations
  // ---------------------------------------------------------------------------
  async createAuditLog(data: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
  }): Promise<AuditLogData> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const created = await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          entityType: data.entityType,
          entity: data.entityType,
          entityId: data.entityId || null,
          metadata: (data.metadata as any) || undefined,
          details: (data.metadata as any) || undefined,
          ipAddress: data.ipAddress || null,
        },
      });
      return {
        id: created.id,
        userId: created.userId,
        action: created.action,
        entityType: created.entityType,
        entityId: created.entityId,
        metadata: created.metadata as Record<string, unknown> | null,
        ipAddress: created.ipAddress,
        createdAt: created.createdAt,
      };
    }

    const log: AuditLogData = {
      id: `aud_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      userId: data.userId || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      createdAt: new Date(),
    };
    MEMORY_AUDIT_LOGS.unshift(log);
    // Keep last 1000 logs in memory
    if (MEMORY_AUDIT_LOGS.length > 1000) {
      MEMORY_AUDIT_LOGS.pop();
    }
    return { ...log };
  }

  async listAuditLogs(limit = 100): Promise<AuditLogData[]> {
    const isLive = await this.checkPrisma();
    if (isLive) {
      const prisma = getPrismaClient()!;
      const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata as Record<string, unknown> | null,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      }));
    }

    return MEMORY_AUDIT_LOGS.slice(0, limit).map((l) => ({ ...l }));
  }


  // ===========================================================================
  // STAFF OPERATIONAL METHODS (Commit 02 / Staff Dashboard Engine)
  // ===========================================================================

  async listCustomers(query?: { search?: string; status?: string; type?: string }): Promise<CustomerOperationalData[]> {
    let result = [...MEMORY_CUSTOMERS];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.legalName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      );
    }

    if (query?.status && query.status !== 'ALL') {
      result = result.filter((c) => c.status === query.status);
    }

    if (query?.type && query.type !== 'ALL') {
      result = result.filter((c) => c.customerType === query.type);
    }

    return result.map((c) => ({ ...c }));
  }

  async getCustomerById(id: string): Promise<{
    customer: CustomerOperationalData;
    subscriptions: SubscriptionOperationalData[];
    invoices: InvoiceOperationalData[];
  } | null> {
    const customer = MEMORY_CUSTOMERS.find((c) => c.id === id);
    if (!customer) return null;

    const subscriptions = MEMORY_SUBSCRIPTIONS.filter((s) => s.customerId === id).map((s) => ({ ...s }));
    const invoices = MEMORY_INVOICES.filter((i) => i.customerId === id).map((i) => ({ ...i }));

    return {
      customer: { ...customer },
      subscriptions,
      invoices,
    };
  }

  async listQuotations(query?: { search?: string; status?: string }): Promise<QuotationOperationalData[]> {
    let result = [...MEMORY_QUOTATIONS];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.quoteNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.product.toLowerCase().includes(q)
      );
    }

    if (query?.status && query.status !== 'ALL') {
      result = result.filter((item) => item.status === query.status);
    }

    return result.map((item) => ({ ...item }));
  }

  async createQuotation(data: {
    customerId: string;
    product: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
    validDays?: number;
    notes?: string;
  }): Promise<QuotationOperationalData> {
    const customer = MEMORY_CUSTOMERS.find((c) => c.id === data.customerId);
    if (!customer) {
      throw new Error('Selected customer does not exist.');
    }

    const qty = Math.max(1, data.quantity || 1);
    const unitPrice = Math.max(0, data.unitPrice);
    const subtotal = Number((qty * unitPrice).toFixed(2));
    const discount = Math.min(subtotal, Math.max(0, data.discount || 0));
    const taxRate = data.taxRate !== undefined ? Math.max(0, data.taxRate) : 8.25;
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxTotal = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const total = Number((taxableAmount + taxTotal).toFixed(2));

    const nextIndex = MEMORY_QUOTATIONS.length + 81;
    const quoteNumber = `QT-2026-${String(nextIndex).padStart(3, '0')}`;
    const validDays = data.validDays || 30;
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    const newQuotation: QuotationOperationalData = {
      id: `qt_${Date.now()}`,
      quoteNumber,
      customerId: customer.id,
      customerName: customer.legalName,
      customerEmail: customer.email,
      product: data.product,
      variant: data.variant || 'Standard SKU',
      quantity: qty,
      unitPrice,
      subtotal,
      taxRate,
      taxTotal,
      discount,
      total,
      status: 'DRAFT',
      validUntil,
      createdAt: new Date(),
      notes: data.notes || 'Payment terms: Net 30 upon acceptance.',
    };

    MEMORY_QUOTATIONS.unshift(newQuotation);
    return { ...newQuotation };
  }

  async updateQuotationStatus(
    id: string,
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  ): Promise<QuotationOperationalData | null> {
    const quote = MEMORY_QUOTATIONS.find((q) => q.id === id);
    if (!quote) return null;

    quote.status = status;
    return { ...quote };
  }

  async listSubscriptions(query?: { search?: string; status?: string; plan?: string }): Promise<SubscriptionOperationalData[]> {
    let result = [...MEMORY_SUBSCRIPTIONS];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.subNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.product.toLowerCase().includes(q)
      );
    }

    if (query?.status && query.status !== 'ALL') {
      result = result.filter((s) => s.status === query.status);
    }

    if (query?.plan && query.plan !== 'ALL') {
      result = result.filter((s) => s.plan.toLowerCase().includes(query.plan!.toLowerCase()));
    }

    return result.map((s) => ({ ...s }));
  }

  async getSubscriptionById(id: string): Promise<{
    subscription: SubscriptionOperationalData;
    invoices: InvoiceOperationalData[];
  } | null> {
    const subscription = MEMORY_SUBSCRIPTIONS.find((s) => s.id === id);
    if (!subscription) return null;

    const invoices = MEMORY_INVOICES.filter((i) => i.subscriptionId === id).map((i) => ({ ...i }));

    return {
      subscription: { ...subscription },
      invoices,
    };
  }

  async listInvoices(query?: { search?: string; status?: string }): Promise<InvoiceOperationalData[]> {
    let result = [...MEMORY_INVOICES];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          (i.subNumber && i.subNumber.toLowerCase().includes(q))
      );
    }

    if (query?.status && query.status !== 'ALL') {
      result = result.filter((i) => i.status === query.status);
    }

    return result.map((i) => ({ ...i }));
  }

  async confirmInvoice(id: string): Promise<InvoiceOperationalData | null> {
    const invoice = MEMORY_INVOICES.find((i) => i.id === id);
    if (!invoice) return null;

    if (invoice.status === 'DRAFT') {
      invoice.status = 'CONFIRMED';
    }
    return { ...invoice };
  }

  async listPayments(query?: { search?: string; method?: string }): Promise<PaymentOperationalData[]> {
    let result = [...MEMORY_PAYMENTS];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.invoiceNumber.toLowerCase().includes(q)
      );
    }

    if (query?.method && query.method !== 'ALL') {
      result = result.filter((p) => p.method === query.method);
    }

    return result.map((p) => ({ ...p }));
  }

  async recordPayment(data: {
    invoiceId: string;
    method: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD';
    reference: string;
    amount: number;
    notes?: string;
  }): Promise<{ payment: PaymentOperationalData; invoice: InvoiceOperationalData }> {
    const invoice = MEMORY_INVOICES.find((i) => i.id === data.invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }

    // Check duplicate reference
    const duplicate = MEMORY_PAYMENTS.find((p) => p.reference.toLowerCase() === data.reference.toLowerCase());
    if (duplicate) {
      throw new Error(`Duplicate transaction reference detected. Reference '${data.reference}' already recorded.`);
    }

    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (data.amount > invoice.balanceDue) {
      throw new Error(`Payment amount ($${data.amount}) exceeds outstanding balance due ($${invoice.balanceDue}).`);
    }

    const newPayment: PaymentOperationalData = {
      id: `pay_${Date.now()}`,
      reference: data.reference,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      method: data.method,
      paymentDate: new Date(),
      amount: data.amount,
      status: 'SUCCEEDED',
      notes: data.notes || null,
    };

    MEMORY_PAYMENTS.unshift(newPayment);

    // Update invoice financial ledger
    invoice.amountPaid = Number((invoice.amountPaid + data.amount).toFixed(2));
    invoice.balanceDue = Number(Math.max(0, invoice.balanceDue - data.amount).toFixed(2));
    if (invoice.balanceDue <= 0.001) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }

    return {
      payment: { ...newPayment },
      invoice: { ...invoice },
    };
  }

  async getStaffOverviewStats(): Promise<{
    assignedCustomers: number;
    activeSubscriptions: number;
    pendingQuotations: number;
    pendingInvoices: number;
    paymentsCollected: number;
    overdueInvoices: number;
    subscriptionTrends: Array<{ month: string; active: number; new: number; churn: number }>;
    recentActivities: Array<{ id: string; type: string; title: string; description: string; time: string; badge: string; badgeColor: string }>;
    pendingTasks: Array<{ id: string; type: string; title: string; subtitle: string; urgency: 'high' | 'medium' | 'low'; actionLabel: string; targetPath: string }>;
  }> {
    const assignedCustomers = MEMORY_CUSTOMERS.length;
    const activeSubscriptions = MEMORY_SUBSCRIPTIONS.filter((s) => s.status === 'ACTIVE').length;
    const pendingQuotations = MEMORY_QUOTATIONS.filter((q) => q.status === 'DRAFT' || q.status === 'SENT').length;
    const pendingInvoices = MEMORY_INVOICES.filter((i) => i.status === 'CONFIRMED' || i.status === 'PARTIALLY_PAID').length;
    const paymentsCollected = MEMORY_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
    const overdueInvoices = MEMORY_INVOICES.filter((i) => i.status === 'OVERDUE').length;

    const subscriptionTrends = [
      { month: 'Jun', active: 118, new: 14, churn: 2 },
      { month: 'Jul', active: 124, new: 10, churn: 4 },
      { month: 'Aug', active: 131, new: 12, churn: 5 },
      { month: 'Sep', active: 138, new: 15, churn: 8 },
      { month: 'Oct', active: 142, new: 11, churn: 7 },
      { month: 'Nov (Proj)', active: 149, new: 13, churn: 6 },
    ];

    const recentActivities = [
      {
        id: 'act_01',
        type: 'payment',
        title: 'Payment Received',
        description: '$18,000.00 via Bank Wire from Oasis Cloud',
        time: '12 mins ago',
        badge: 'Settled',
        badgeColor: 'teal',
      },
      {
        id: 'act_02',
        type: 'quotation',
        title: 'Quotation Accepted',
        description: 'Quantum Labs accepted QT-2026-083 ($1,190.75)',
        time: '45 mins ago',
        badge: 'Accepted',
        badgeColor: 'cyan',
      },
      {
        id: 'act_03',
        type: 'invoice',
        title: 'Invoice Dispatched',
        description: 'Dispatched INV-2026-106 to Nexa Robotics',
        time: '2 hours ago',
        badge: 'Issued',
        badgeColor: 'violet',
      },
      {
        id: 'act_04',
        type: 'customer',
        title: 'New Account Onboarded',
        description: 'Nexa Robotics AI completed workspace setup',
        time: '5 hours ago',
        badge: 'Active',
        badgeColor: 'teal',
      },
      {
        id: 'act_05',
        type: 'subscription',
        title: 'Subscription Renewed',
        description: 'Synthetix Dynamics Q4 renewal confirmed',
        time: '1 day ago',
        badge: 'Renewed',
        badgeColor: 'cyan',
      },
    ];

    const pendingTasks = [
      {
        id: 'task_01',
        type: 'quotation',
        title: 'Follow up on QT-2026-082',
        subtitle: 'Synthetix Dynamics expansion quote expires in 3 days',
        urgency: 'high' as const,
        actionLabel: 'View Quote',
        targetPath: '/staff/quotations',
      },
      {
        id: 'task_02',
        type: 'invoice',
        title: 'Overdue Notice INV-2026-105',
        subtitle: 'Apex Logistics balance ($3,800.00) overdue by 36 days',
        urgency: 'high' as const,
        actionLabel: 'Collect Payment',
        targetPath: '/staff/payments',
      },
      {
        id: 'task_03',
        type: 'subscription',
        title: 'Renewal upcoming: Oasis Cloud',
        subtitle: 'Enterprise cluster renewal scheduled for Nov 05',
        urgency: 'medium' as const,
        actionLabel: 'Check Subscription',
        targetPath: '/staff/subscriptions',
      },
      {
        id: 'task_04',
        type: 'invoice',
        title: 'Confirm Draft Invoice INV-2026-107',
        subtitle: 'Quantum Labs onboarding billing ready for confirmation',
        urgency: 'low' as const,
        actionLabel: 'Confirm Invoice',
        targetPath: '/staff/invoices',
      },
    ];

    return {
      assignedCustomers,
      activeSubscriptions,
      pendingQuotations,
      pendingInvoices,
      paymentsCollected,
      overdueInvoices,
      subscriptionTrends,
      recentActivities,
      pendingTasks,
    };
  }

  async getStaffReports(): Promise<{
    assignedCustomerReport: {
      totalAccounts: number;
      activeRate: number;
      healthScore: number;
      distribution: Array<{ tier: string; count: number; value: number }>;
    };
    subscriptionReport: {
      totalActive: number;
      mrr: number;
      renewalRate: number;
      plans: Array<{ plan: string; count: number; mrr: number }>;
    };
    quotationReport: {
      totalCreated: number;
      totalValue: number;
      winRate: number;
      statusCounts: Record<string, number>;
    };
    invoiceReport: {
      totalInvoiced: number;
      totalCollected: number;
      overdueTotal: number;
      dsoDays: number;
      statusCounts: Record<string, number>;
    };
    paymentReport: {
      totalVolume: number;
      count: number;
      byMethod: Record<string, number>;
    };
  }> {
    const totalAccounts = MEMORY_CUSTOMERS.length;
    const activeAccounts = MEMORY_CUSTOMERS.filter((c) => c.status === 'ACTIVE').length;
    const activeRate = Number(((activeAccounts / totalAccounts) * 100).toFixed(1));

    const customerTiers = [
      { tier: 'Enterprise', count: 3, value: 98400 },
      { tier: 'Mid-Market', count: 3, value: 8600 },
      { tier: 'Startup', count: 2, value: 2140 },
    ];

    const activeSubs = MEMORY_SUBSCRIPTIONS.filter((s) => s.status === 'ACTIVE');
    const plansDistribution = [
      { plan: 'Enterprise Annual', count: 2, mrr: 7000 },
      { plan: 'Scale Engine', count: 2, mrr: 8600 },
      { plan: 'Growth Monthly', count: 1, mrr: 2400 },
      { plan: 'Starter Monthly', count: 1, mrr: 950 },
    ];

    const totalQuotationValue = MEMORY_QUOTATIONS.reduce((acc, q) => acc + q.total, 0);
    const acceptedQuotes = MEMORY_QUOTATIONS.filter((q) => q.status === 'ACCEPTED').length;
    const closedQuotes = MEMORY_QUOTATIONS.filter((q) => q.status === 'ACCEPTED' || q.status === 'REJECTED' || q.status === 'EXPIRED').length;
    const winRate = closedQuotes > 0 ? Number(((acceptedQuotes / closedQuotes) * 100).toFixed(1)) : 75;

    const quoteStatusCounts: Record<string, number> = {};
    for (const q of MEMORY_QUOTATIONS) {
      quoteStatusCounts[q.status] = (quoteStatusCounts[q.status] || 0) + 1;
    }

    const totalInvoiced = MEMORY_INVOICES.reduce((acc, i) => acc + i.total, 0);
    const totalCollected = MEMORY_INVOICES.reduce((acc, i) => acc + i.amountPaid, 0);
    const overdueTotal = MEMORY_INVOICES.filter((i) => i.status === 'OVERDUE').reduce((acc, i) => acc + i.balanceDue, 0);

    const invoiceStatusCounts: Record<string, number> = {};
    for (const i of MEMORY_INVOICES) {
      invoiceStatusCounts[i.status] = (invoiceStatusCounts[i.status] || 0) + 1;
    }

    const paymentByMethod: Record<string, number> = {};
    for (const p of MEMORY_PAYMENTS) {
      paymentByMethod[p.method] = (paymentByMethod[p.method] || 0) + p.amount;
    }

    return {
      assignedCustomerReport: {
        totalAccounts,
        activeRate,
        healthScore: 94.2,
        distribution: customerTiers,
      },
      subscriptionReport: {
        totalActive: activeSubs.length,
        mrr: 18950,
        renewalRate: 96.8,
        plans: plansDistribution,
      },
      quotationReport: {
        totalCreated: MEMORY_QUOTATIONS.length,
        totalValue: totalQuotationValue,
        winRate,
        statusCounts: quoteStatusCounts,
      },
      invoiceReport: {
        totalInvoiced,
        totalCollected,
        overdueTotal,
        dsoDays: 24,
        statusCounts: invoiceStatusCounts,
      },
      paymentReport: {
        totalVolume: MEMORY_PAYMENTS.reduce((acc, p) => acc + p.amount, 0),
        count: MEMORY_PAYMENTS.length,
        byMethod: paymentByMethod,
      },
    };
  }
}

export const store = new StoreService();
