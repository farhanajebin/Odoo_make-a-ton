import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface AdminBadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  statusText?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/70',
  info: 'bg-sky-50 text-sky-700 border-sky-200/70',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
};

// Automatic status mapping helper
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const s = status.toLowerCase();
  if (['active', 'confirmed', 'paid', 'completed', 'converted'].includes(s)) return 'success';
  if (['draft', 'pending', 'lead'].includes(s)) return 'neutral';
  if (['paused', 'sent'].includes(s)) return 'warning';
  if (['closed', 'cancelled', 'overdue', 'failed', 'delinquent', 'expired'].includes(s)) return 'danger';
  if (['quotation', 'accepted', 'recurring subscription'].includes(s)) return 'info';
  if (['admin', 'enterprise'].includes(s)) return 'purple';
  return 'default';
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant,
  statusText,
  size = 'md',
  className = '',
}) => {
  const resolvedVariant = variant || (statusText ? getStatusBadgeVariant(statusText) : 'default');

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantStyles[resolvedVariant]}
        ${sizeClass}
        ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current opacity-80" />
      {children || statusText}
    </span>
  );
};
