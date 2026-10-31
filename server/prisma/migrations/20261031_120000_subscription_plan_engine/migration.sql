CREATE TYPE "BillingFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
CREATE TYPE "PlanPricingMode" AS ENUM ('PRODUCT_BASED', 'VARIANT_BASED', 'CUSTOM');
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "PlanHistoryAction" AS ENUM ('CREATED', 'UPDATED', 'PRICE_CHANGED', 'PRICING_MODE_CHANGED', 'BILLING_FREQUENCY_CHANGED', 'MINIMUM_QUANTITY_CHANGED', 'AVAILABILITY_CHANGED', 'STATUS_CHANGED');

CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "billingFrequency" "BillingFrequency" NOT NULL DEFAULT 'MONTHLY',
    "pricingMode" "PlanPricingMode" NOT NULL DEFAULT 'PRODUCT_BASED',
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minimumQuantity" INTEGER NOT NULL DEFAULT 1,
    "availabilityStart" TIMESTAMP(3) NOT NULL,
    "availabilityEnd" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscription_plans_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscription_plans_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "subscription_plans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "plan_history" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "PlanHistoryAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plan_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "plan_history_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plan_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "subscription_plans_productId_idx" ON "subscription_plans"("productId");
CREATE INDEX IF NOT EXISTS "subscription_plans_variantId_idx" ON "subscription_plans"("variantId");
CREATE INDEX IF NOT EXISTS "subscription_plans_status_idx" ON "subscription_plans"("status");
CREATE INDEX IF NOT EXISTS "subscription_plans_billingFrequency_idx" ON "subscription_plans"("billingFrequency");
CREATE INDEX IF NOT EXISTS "plan_history_planId_createdAt_idx" ON "plan_history"("planId", "createdAt");
