import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store.service.js';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  calculateBillingAmount,
  normalizeFrequency,
  normalizePricingMode,
  resolveUnitPrice,
  validatePlanAvailability,
  validateQuantity,
} from '../utils/planPricing.js';

const planCreateSchema = z.object({
  name: z.string().trim().min(1, 'Plan name is required.'),
  description: z.string().trim().optional().nullable(),
  productId: z.string().trim().min(1, 'Product is required.'),
  variantId: z.string().trim().optional().nullable(),
  billingFrequency: z.string().trim().optional(),
  pricingMode: z.string().trim().optional(),
  unitPrice: z.union([z.string(), z.number()]).transform((value) => `${value}`),
  currency: z.string().trim().optional().default('USD'),
  minimumQuantity: z.coerce.number().int().min(1).default(1),
  availabilityStart: z.string().trim().min(1, 'Availability start date is required.'),
  availabilityEnd: z.string().trim().optional().nullable(),
  status: z.string().trim().optional().default('DRAFT'),
  createdById: z.string().trim().optional().nullable(),
});

const planUpdateSchema = planCreateSchema.partial();

const pricingPreviewSchema = z.object({
  productPrice: z.union([z.string(), z.number()]).default('0'),
  variantPrice: z.union([z.string(), z.number()]).optional().default('0'),
  customPlanPrice: z.union([z.string(), z.number()]).optional().default('0'),
  pricingMode: z.string().trim().optional().default('PRODUCT_BASED'),
  minimumQuantity: z.coerce.number().int().min(1).default(1),
  quantity: z.coerce.number().int().min(1).default(1),
  billingFrequency: z.string().trim().optional().default('MONTHLY'),
});

const statusTransition: Record<string, string[]> = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['PAUSED', 'ARCHIVED'],
  PAUSED: ['ACTIVE', 'ARCHIVED'],
  ARCHIVED: [],
};

function isNegativePrice(value: string | number): boolean {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric < 0;
}

function normalizeStatus(value: string | undefined): string {
  return String(value || 'DRAFT').toUpperCase();
}

async function recordPlanActivity(
  planId: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  actorId?: string | null
): Promise<void> {
  await store.createPlanHistoryEntry({
    planId,
    actorId,
    action,
    before,
    after,
  });
}

export async function listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;

    const allPlans = await store.listPlans({
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      billingFrequency: typeof req.query.billingFrequency === 'string' ? req.query.billingFrequency : undefined,
      productId: typeof req.query.productId === 'string' ? req.query.productId : undefined,
    });

    const total = allPlans.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const startIndex = (safePage - 1) * safeLimit;
    const plans = allPlans.slice(startIndex, startIndex + safeLimit);

    sendSuccess(res, {
      plans,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      filters: {
        search: req.query.search || null,
        status: req.query.status || null,
        billingFrequency: req.query.billingFrequency || null,
        productId: req.query.productId || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = planCreateSchema.parse(req.body);
    const priceValue = Number(payload.unitPrice);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      sendError(res, 'Plan unit price must be a non-negative number.', 400, 'INVALID_UNIT_PRICE');
      return;
    }

    const availability = validatePlanAvailability(payload.availabilityStart, payload.availabilityEnd);
    if (!availability.valid) {
      sendError(res, availability.message || 'Plan availability is invalid.', 400, 'INVALID_AVAILABILITY');
      return;
    }

    if (payload.minimumQuantity < 1 || !Number.isInteger(payload.minimumQuantity)) {
      sendError(res, 'Minimum quantity must be a positive integer.', 400, 'INVALID_MINIMUM_QUANTITY');
      return;
    }

    const normalizedStatus = normalizeStatus(payload.status);
    const plan = await store.createPlan({
      name: payload.name,
      description: payload.description || null,
      productId: payload.productId,
      variantId: payload.variantId || null,
      billingFrequency: normalizeFrequency(payload.billingFrequency),
      pricingMode: normalizePricingMode(payload.pricingMode),
      unitPrice: payload.unitPrice,
      currency: payload.currency,
      minimumQuantity: payload.minimumQuantity,
      availabilityStart: payload.availabilityStart,
      availabilityEnd: payload.availabilityEnd || null,
      status: normalizedStatus as any,
      createdById: payload.createdById || req.user?.id || null,
    });

    await recordPlanActivity(
      plan.id,
      'CREATED',
      null,
      {
        planId: plan.id,
        name: plan.name,
        status: plan.status,
        unitPrice: plan.unitPrice,
      },
      req.user?.id
    );

    sendSuccess(res, { plan }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, error.issues[0]?.message || 'Invalid plan payload.', 400, 'INVALID_PLAN_PAYLOAD', error.issues);
      return;
    }

    next(error);
  }
}

export async function getPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    sendSuccess(res, { plan });
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await store.findPlanById(req.params.id);
    if (!existing) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const payload = planUpdateSchema.parse(req.body);

    if (payload.unitPrice !== undefined) {
      const numericPrice = Number(payload.unitPrice);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        sendError(res, 'Plan unit price must be a non-negative number.', 400, 'INVALID_UNIT_PRICE');
        return;
      }
    }

    if (payload.availabilityStart || payload.availabilityEnd) {
      const availability = validatePlanAvailability(
        payload.availabilityStart || existing.availabilityStart,
        payload.availabilityEnd !== undefined ? payload.availabilityEnd : existing.availabilityEnd
      );
      if (!availability.valid) {
        sendError(res, availability.message || 'Plan availability is invalid.', 400, 'INVALID_AVAILABILITY');
        return;
      }
    }

    if (payload.minimumQuantity !== undefined && (payload.minimumQuantity < 1 || !Number.isInteger(payload.minimumQuantity))) {
      sendError(res, 'Minimum quantity must be a positive integer.', 400, 'INVALID_MINIMUM_QUANTITY');
      return;
    }

    const nextPlan = await store.updatePlan(existing.id, {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.description !== undefined && { description: payload.description || null }),
      ...(payload.productId !== undefined && { productId: payload.productId }),
      ...(payload.variantId !== undefined && { variantId: payload.variantId || null }),
      ...(payload.billingFrequency !== undefined && { billingFrequency: normalizeFrequency(payload.billingFrequency) as any }),
      ...(payload.pricingMode !== undefined && { pricingMode: normalizePricingMode(payload.pricingMode) as any }),
      ...(payload.unitPrice !== undefined && { unitPrice: String(payload.unitPrice) }),
      ...(payload.currency !== undefined && { currency: payload.currency }),
      ...(payload.minimumQuantity !== undefined && { minimumQuantity: payload.minimumQuantity }),
      ...(payload.availabilityStart !== undefined && { availabilityStart: payload.availabilityStart }),
      ...(payload.availabilityEnd !== undefined && { availabilityEnd: payload.availabilityEnd || null }),
      ...(payload.status !== undefined && { status: normalizeStatus(payload.status) as any }),
    });

    if (!nextPlan) {
      sendError(res, 'Plan update failed.', 500, 'PLAN_UPDATE_FAILED');
      return;
    }

    await recordPlanActivity(
      nextPlan.id,
      'UPDATED',
      { status: existing.status, unitPrice: existing.unitPrice, minQuantity: existing.minimumQuantity },
      { status: nextPlan.status, unitPrice: nextPlan.unitPrice, minQuantity: nextPlan.minimumQuantity },
      req.user?.id
    );

    sendSuccess(res, { plan: nextPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, error.issues[0]?.message || 'Invalid plan update payload.', 400, 'INVALID_PLAN_PAYLOAD', error.issues);
      return;
    }

    next(error);
  }
}

export async function activatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const nextStatus = 'ACTIVE';
    if (!statusTransition[plan.status]?.includes(nextStatus)) {
      sendError(res, `Invalid lifecycle transition from ${plan.status} to ${nextStatus}.`, 400, 'INVALID_PLAN_STATUS_TRANSITION');
      return;
    }

    const updated = await store.updatePlan(plan.id, { status: nextStatus as any });
    await recordPlanActivity(plan.id, 'STATUS_CHANGED', { status: plan.status }, { status: nextStatus }, req.user?.id);

    sendSuccess(res, { plan: updated });
  } catch (error) {
    next(error);
  }
}

export async function pausePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const nextStatus = 'PAUSED';
    if (!statusTransition[plan.status]?.includes(nextStatus)) {
      sendError(res, `Invalid lifecycle transition from ${plan.status} to ${nextStatus}.`, 400, 'INVALID_PLAN_STATUS_TRANSITION');
      return;
    }

    const updated = await store.updatePlan(plan.id, { status: nextStatus as any });
    await recordPlanActivity(plan.id, 'STATUS_CHANGED', { status: plan.status }, { status: nextStatus }, req.user?.id);

    sendSuccess(res, { plan: updated });
  } catch (error) {
    next(error);
  }
}

export async function resumePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const nextStatus = 'ACTIVE';
    if (!statusTransition[plan.status]?.includes(nextStatus)) {
      sendError(res, `Invalid lifecycle transition from ${plan.status} to ${nextStatus}.`, 400, 'INVALID_PLAN_STATUS_TRANSITION');
      return;
    }

    const updated = await store.updatePlan(plan.id, { status: nextStatus as any });
    await recordPlanActivity(plan.id, 'STATUS_CHANGED', { status: plan.status }, { status: nextStatus }, req.user?.id);

    sendSuccess(res, { plan: updated });
  } catch (error) {
    next(error);
  }
}

export async function archivePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const nextStatus = 'ARCHIVED';
    if (!statusTransition[plan.status]?.includes(nextStatus)) {
      sendError(res, `Invalid lifecycle transition from ${plan.status} to ${nextStatus}.`, 400, 'INVALID_PLAN_STATUS_TRANSITION');
      return;
    }

    const updated = await store.updatePlan(plan.id, {
      status: nextStatus as any,
      archivedAt: new Date(),
    });
    await recordPlanActivity(plan.id, 'STATUS_CHANGED', { status: plan.status }, { status: nextStatus }, req.user?.id);

    sendSuccess(res, { plan: updated });
  } catch (error) {
    next(error);
  }
}

export async function getPlanHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const history = await store.listPlanHistory(plan.id);
    sendSuccess(res, { planId: plan.id, history });
  } catch (error) {
    next(error);
  }
}

export async function pricePreview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = pricingPreviewSchema.parse(req.body);
    const unitPrice = resolveUnitPrice({
      productPrice: payload.productPrice,
      variantPrice: payload.variantPrice,
      pricingMode: payload.pricingMode,
      customPlanPrice: payload.customPlanPrice,
    });

    if (isNegativePrice(unitPrice)) {
      sendError(res, 'Price cannot be negative.', 400, 'INVALID_UNIT_PRICE');
      return;
    }

    const quantityValidation = validateQuantity(payload.quantity, payload.minimumQuantity);
    if (!quantityValidation.valid) {
      sendError(res, quantityValidation.message || 'Invalid quantity.', 400, 'INVALID_QUANTITY');
      return;
    }

    const finalBillingAmount = calculateBillingAmount({ unitPrice, quantity: payload.quantity });
    sendSuccess(res, {
      productPrice: payload.productPrice,
      variantPrice: payload.variantPrice,
      pricingMode: normalizePricingMode(payload.pricingMode),
      billingFrequency: normalizeFrequency(payload.billingFrequency),
      quantity: payload.quantity,
      minimumQuantity: payload.minimumQuantity,
      unitPrice,
      finalBillingAmount,
      isValid: true,
      breakdown: {
        calculatedUnitPrice: unitPrice,
        quantity: payload.quantity,
        total: finalBillingAmount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, error.issues[0]?.message || 'Invalid pricing preview payload.', 400, 'INVALID_PRICING_PREVIEW', error.issues);
      return;
    }

    next(error);
  }
}

export async function getPlanPricing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await store.findPlanById(req.params.id);
    if (!plan) {
      sendError(res, 'Plan not found.', 404, 'PLAN_NOT_FOUND');
      return;
    }

    const pricing = {
      planId: plan.id,
      pricingMode: plan.pricingMode,
      billingFrequency: plan.billingFrequency,
      unitPrice: plan.unitPrice,
      minimumQuantity: plan.minimumQuantity,
      finalBillingAmount: calculateBillingAmount({
        unitPrice: plan.unitPrice,
        quantity: plan.minimumQuantity,
      }),
      quantityBreakdown: {
        selectedQuantity: plan.minimumQuantity,
        minimumQuantity: plan.minimumQuantity,
      },
    };

    sendSuccess(res, { pricing });
  } catch (error) {
    next(error);
  }
}
