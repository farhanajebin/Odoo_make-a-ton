import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-slate-700 dark:text-loopnex-secondaryText mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-loopnex-secondaryText">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-white dark:bg-loopnex-surface/70 px-3.5 py-2 text-sm text-slate-900 dark:text-loopnex-primaryText placeholder-slate-400 dark:placeholder-slate-500 transition-colors',
              'border-slate-200 dark:border-loopnex-surfaceBorder focus:border-loopnex-electricTeal focus:outline-none focus:ring-1 focus:ring-loopnex-electricTeal',
              icon && 'pl-9',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
