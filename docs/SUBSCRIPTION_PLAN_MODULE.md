# Subscription Plan Module

## Overview
The Subscription Plan Studio introduces a trusted recurring billing layer for LOOPNEX. Plans are configured around an existing product and optional product variant, then validated through backend pricing and availability rules before becoming active or being archived.

## Plan model
The canonical plan record includes:
- `id`
- `name`
- `description`
- `productId`
- `variantId` (optional)
- `billingFrequency` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`)
- `pricingMode` (`PRODUCT_BASED`, `VARIANT_BASED`, `CUSTOM`)
- `unitPrice`
- `currency`
- `minimumQuantity`
- `availabilityStart`
- `availabilityEnd`
- `status` (`DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED`)
- `createdById`
- `createdAt`
- `updatedAt`
- `archivedAt`

## Product and variant relationships
- Every plan is linked to a product.
- If a plan is bound to a product variant, pricing can include the variant's additional sales price.
- Variant relationships are validated before the plan is persisted.
- Archived products or variants are not permitted in active billing configuration.

## Billing frequency and pricing modes
Billing frequency values:
- DAILY
- WEEKLY
- MONTHLY
- YEARLY

Pricing modes:
- `PRODUCT_BASED`: unit price is derived from the product sales price.
- `VARIANT_BASED`: unit price is the product sales price plus the variant additional charge.
- `CUSTOM`: the plan uses a user-defined custom pricing override.

## Pricing formulas
The backend is the source of truth for revenue math. All calculations are performed with decimal-safe string/BigInt arithmetic rather than JavaScript floats.

Examples:
- Product-derived price: `unitPrice = product.salesPrice`
- Variant-derived price: `unitPrice = product.salesPrice + variant.additionalPrice`
- Custom plan price: `unitPrice = plan.customUnitPrice`
- Final billing amount: `final = unitPrice × quantity`

Minimum quantity rules:
- Minimum quantity must be a positive integer.
- Quantity must not be lower than the configured plan minimum.
- Negative prices are rejected.

## Availability rules
- A plan cannot be active before `availabilityStart`.
- A plan cannot be available after `availabilityEnd`.
- `availabilityEnd` cannot be earlier than `availabilityStart`.
- Archived plans remain readable for historical context but cannot be used for new quotations.

## Lifecycle transitions
Valid status flows:
- `DRAFT -> ACTIVE`
- `DRAFT -> ARCHIVED`
- `ACTIVE -> PAUSED`
- `ACTIVE -> ARCHIVED`
- `PAUSED -> ACTIVE`
- `PAUSED -> ARCHIVED`

Invalid transitions are rejected by the backend.

## APIs
Supported endpoints:
- `POST /api/plans`
- `GET /api/plans`
- `GET /api/plans/:id`
- `PATCH /api/plans/:id`
- `PATCH /api/plans/:id/activate`
- `PATCH /api/plans/:id/pause`
- `PATCH /api/plans/:id/resume`
- `PATCH /api/plans/:id/archive`
- `GET /api/plans/:id/history`
- `POST /api/plans/price-preview`
- `GET /api/plans/:id/pricing`

## Permissions
- `ADMIN`: full plan management and access to all history
- `STAFF`: plan viewing and operations allowed under the existing staff permission structure
- `CUSTOMER`: no plan management access

## Database migration
The migration file is located at:
`server/prisma/migrations/20261031_120000_subscription_plan_engine/migration.sql`

## Tests
The plan module validation script is in:
`server/src/tests/plan_management.ts`

Run it with:
```bash
npx tsx server/src/tests/plan_management.ts
```
