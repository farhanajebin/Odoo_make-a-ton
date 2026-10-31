import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------
const createQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  product: z.string().min(1, 'Product name is required'),
  variant: z.string().default('Standard SKU'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  taxRate: z.number().nonnegative().optional().default(8.25),
  discount: z.number().nonnegative().optional().default(0),
  validDays: z.number().int().positive().optional().default(30),
  notes: z.string().optional(),
});

const updateQuoteStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
});

const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  method: z.enum(['UPI', 'BANK_TRANSFER', 'CASH', 'CARD']),
  reference: z.string().min(2, 'Transaction reference is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  notes: z.string().optional(),
});

// -----------------------------------------------------------------------------
// Controller Actions
// -----------------------------------------------------------------------------

export async function getStaffOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await store.getStaffOverviewStats();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status, type } = req.query as {
      search?: string;
      status?: string;
      type?: string;
    };

    const customers = await store.listCustomers({ search, status, type });
    sendSuccess(res, { customers });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await store.getCustomerById(req.params.id);
    if (!result) {
      sendError(res, 'Customer record not found.', 404, 'NOT_FOUND');
      return;
    }
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status } = req.query as { search?: string; status?: string };
    const quotations = await store.listQuotations({ search, status });
    sendSuccess(res, { quotations });
  } catch (error) {
    next(error);
  }
}

export async function createQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createQuotationSchema.parse(req.body);
    const quotation = await store.createQuotation(validated);

    // Record audit event
    await store.createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_QUOTATION',
      entityType: 'QUOTATION',
      entityId: quotation.id,
      metadata: {
        quoteNumber: quotation.quoteNumber,
        customerName: quotation.customerName,
        total: quotation.total,
      },
      ipAddress: req.ip || null,
    });

    sendSuccess(res, { quotation }, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      sendError(res, error.errors[0]?.message || 'Invalid quotation parameters.', 400, 'VALIDATION_ERROR');
      return;
    }
    sendError(res, error.message || 'Failed to create quotation.', 400, 'BAD_REQUEST');
  }
}

export async function updateQuotationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = updateQuoteStatusSchema.parse(req.body);
    const quotation = await store.updateQuotationStatus(req.params.id, status);

    if (!quotation) {
      sendError(res, 'Quotation not found.', 404, 'NOT_FOUND');
      return;
    }

    await store.createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_QUOTATION_STATUS',
      entityType: 'QUOTATION',
      entityId: quotation.id,
      metadata: { quoteNumber: quotation.quoteNumber, status },
      ipAddress: req.ip || null,
    });

    sendSuccess(res, { quotation });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      sendError(res, error.errors[0]?.message || 'Invalid status transition.', 400, 'VALIDATION_ERROR');
      return;
    }
    next(error);
  }
}

export async function getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status, plan } = req.query as {
      search?: string;
      status?: string;
      plan?: string;
    };
    const subscriptions = await store.listSubscriptions({ search, status, plan });
    sendSuccess(res, { subscriptions });
  } catch (error) {
    next(error);
  }
}

export async function getSubscriptionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await store.getSubscriptionById(req.params.id);
    if (!result) {
      sendError(res, 'Subscription record not found.', 404, 'NOT_FOUND');
      return;
    }
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status } = req.query as { search?: string; status?: string };
    const invoices = await store.listInvoices({ search, status });
    sendSuccess(res, { invoices });
  } catch (error) {
    next(error);
  }
}

export async function confirmInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await store.confirmInvoice(req.params.id);
    if (!invoice) {
      sendError(res, 'Invoice not found.', 404, 'NOT_FOUND');
      return;
    }

    await store.createAuditLog({
      userId: req.user?.id,
      action: 'CONFIRM_INVOICE',
      entityType: 'INVOICE',
      entityId: invoice.id,
      metadata: { invoiceNumber: invoice.invoiceNumber, total: invoice.total },
      ipAddress: req.ip || null,
    });

    sendSuccess(res, { invoice });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, method } = req.query as { search?: string; method?: string };
    const payments = await store.listPayments({ search, method });
    sendSuccess(res, { payments });
  } catch (error) {
    next(error);
  }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = recordPaymentSchema.parse(req.body);
    const result = await store.recordPayment(validated);

    await store.createAuditLog({
      userId: req.user?.id,
      action: 'RECORD_PAYMENT',
      entityType: 'PAYMENT',
      entityId: result.payment.id,
      metadata: {
        reference: result.payment.reference,
        amount: result.payment.amount,
        method: result.payment.method,
        invoiceNumber: result.invoice.invoiceNumber,
      },
      ipAddress: req.ip || null,
    });

    sendSuccess(res, result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      sendError(res, error.errors[0]?.message || 'Invalid payment parameters.', 400, 'VALIDATION_ERROR');
      return;
    }
    const isConflict = error.message && error.message.includes('Duplicate');
    sendError(res, error.message || 'Payment recording failed.', isConflict ? 409 : 400, isConflict ? 'DUPLICATE_REFERENCE' : 'BAD_REQUEST');
  }
}

export async function getStaffReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reports = await store.getStaffReports();
    sendSuccess(res, { reports });
  } catch (error) {
    next(error);
  }
}

