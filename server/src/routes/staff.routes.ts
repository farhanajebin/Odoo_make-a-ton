import { Router } from 'express';
import {
  getStaffOverview,
  getCustomers,
  getCustomerDetails,
  getQuotations,
  createQuotation,
  updateQuotationStatus,
  getSubscriptions,
  getSubscriptionDetails,
  getInvoices,
  confirmInvoice,
  getPayments,
  recordPayment,
  getStaffReports,
} from '../controllers/staff.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Secure all staff operational routes
router.use(authenticateUser);
router.use(requireRole('STAFF', 'ADMIN'));

// Staff Dashboard Overview
router.get('/overview', getStaffOverview);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetails);

// Quotations
router.get('/quotations', getQuotations);
router.post('/quotations', createQuotation);
router.patch('/quotations/:id/status', updateQuotationStatus);

// Subscriptions
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscriptionDetails);

// Invoices
router.get('/invoices', getInvoices);
router.patch('/invoices/:id/confirm', confirmInvoice);

// Payments
router.get('/payments', getPayments);
router.post('/payments', recordPayment);

// Operational Reports
router.get('/reports', getStaffReports);

export default router;

