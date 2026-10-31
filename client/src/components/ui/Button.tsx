import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-loopnex-electricTeal text-loopnex-deepNavy font-semibold hover:bg-[#20BEAE] focus:ring-loopnex-electricTeal shadow-sm shadow-loopnex-electricTeal/20',
    secondary:
      'bg-loopnex-surface text-loopnex-primaryText hover:bg-loopnex-surfaceLight dark:bg-loopnex-surface dark:hover:bg-loopnex-surfaceLight dark:text-loopnex-primaryText border border-slate-200 dark:border-loopnex-surfaceBorder text-slate-800',
    outline:
      'border border-slate-300 dark:border-loopnex-surfaceBorder bg-transparent hover:bg-slate-100 dark:hover:bg-loopnex-surfaceLight text-slate-700 dark:text-loopnex-primaryText',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-loopnex-surface/80 text-slate-600 dark:text-loopnex-secondaryText hover:text-slate-900 dark:hover:text-loopnex-primaryText',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
