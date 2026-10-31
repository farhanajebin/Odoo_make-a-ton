export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type PlanPricingMode = 'PRODUCT_BASED' | 'VARIANT_BASED' | 'CUSTOM';

export function normalizeFrequency(value: string | undefined): BillingFrequency {
  const normalized = (value || 'MONTHLY').toUpperCase().replace(/-/g, '_');
  switch (normalized) {
    case 'DAILY':
      return 'DAILY';
    case 'WEEKLY':
      return 'WEEKLY';
    case 'YEARLY':
    case 'ANNUAL':
      return 'YEARLY';
    case 'MONTHLY':
    default:
      return 'MONTHLY';
  }
}

export function normalizePricingMode(value: string | undefined): PlanPricingMode {
  const normalized = (value || 'PRODUCT_BASED').toUpperCase().replace(/-/g, '_');
  switch (normalized) {
    case 'PRODUCT':
    case 'PRODUCT_BASED':
      return 'PRODUCT_BASED';
    case 'VARIANT':
    case 'VARIANT_BASED':
      return 'VARIANT_BASED';
    case 'CUSTOM':
      return 'CUSTOM';
    default:
      return 'PRODUCT_BASED';
  }
}

function normalizeAmountInput(value: string | number | bigint | null | undefined): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const stringValue = String(value).trim();
  if (!stringValue || stringValue === 'null' || stringValue === 'undefined') {
    return '0';
  }

  return stringValue.replace(/,/g, '');
}

function toMinorUnits(value: string | number | bigint | null | undefined): bigint {
  const normalized = normalizeAmountInput(value);
  const sign = normalized.startsWith('-') ? -1n : 1n;
  const unsigned = normalized.replace(/^[-+]/, '');
  const [wholePart = '0', fractionPart = ''] = unsigned.split('.');
  const compactWhole = wholePart.replace(/^0+(?=\d)/, '') || '0';
  const compactFraction = (fractionPart + '00').slice(0, 2);
  const minor = BigInt(`${compactWhole}${compactFraction}`);
  return sign * minor;
}

export function fromMinorUnits(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const whole = absolute / 100n;
  const fraction = absolute % 100n;
  return `${sign}${whole.toString()}.${fraction.toString().padStart(2, '0')}`;
}

export function addMoney(a: string | number | bigint, b: string | number | bigint): string {
  return fromMinorUnits(toMinorUnits(a) + toMinorUnits(b));
}

export function subtractMoney(a: string | number | bigint, b: string | number | bigint): string {
  return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
}

export function multiplyMoney(base: string | number | bigint, multiplier: number): string {
  const safeMultiplier = Number.isFinite(multiplier) ? Math.trunc(multiplier) : 0;
  return fromMinorUnits(toMinorUnits(base) * BigInt(safeMultiplier));
}

export function resolveUnitPrice({
  productPrice,
  variantPrice = 0,
  pricingMode,
  customPlanPrice,
}: {
  productPrice: string | number | bigint;
  variantPrice?: string | number | bigint;
  pricingMode?: string;
  customPlanPrice?: string | number | bigint;
}): string {
  const mode = normalizePricingMode(pricingMode);

  if (mode === 'CUSTOM') {
    return normalizeAmountInput(customPlanPrice ?? productPrice);
  }

  if (mode === 'VARIANT_BASED') {
    return addMoney(productPrice, variantPrice);
  }

  return normalizeAmountInput(productPrice);
}

export function calculateBillingAmount({
  unitPrice,
  quantity,
}: {
  unitPrice: string | number | bigint;
  quantity: number;
}): string {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.trunc(quantity)) : 0;
  return multiplyMoney(unitPrice, safeQuantity);
}

export function validatePlanAvailability(startDate: string, endDate?: string | null): { valid: boolean; message?: string } {
  if (!startDate) {
    return { valid: false, message: 'Plan start date is required.' };
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (Number.isNaN(start.getTime())) {
    return { valid: false, message: 'Plan start date is invalid.' };
  }

  if (end && Number.isNaN(end.getTime())) {
    return { valid: false, message: 'Plan end date is invalid.' };
  }

  if (end && end < start) {
    return { valid: false, message: 'Plan end date cannot precede the start date.' };
  }

  return { valid: true };
}

export function validateQuantity(quantity: number, minimumQuantity: number): { valid: boolean; message?: string } {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { valid: false, message: 'Quantity must be a positive integer.' };
  }

  if (!Number.isInteger(quantity)) {
    return { valid: false, message: 'Quantity must be a whole number.' };
  }

  if (quantity < minimumQuantity) {
    return { valid: false, message: `Quantity must be at least ${minimumQuantity}.` };
  }

  return { valid: true };
}
