import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'violet' | 'cyan' | 'amber' | 'emerald' | 'rose' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'slate',
  size = 'sm',
  ...props
}) => {
  const variants = {
    teal: 'bg-emerald-500/10 text-emerald-600 dark:bg-loopnex-electricTeal/15 dark:text-loopnex-electricTeal border-emerald-500/20 dark:border-loopnex-electricTeal/30',
    violet: 'bg-violet-500/10 text-violet-600 dark:bg-loopnex-violetAccent/20 dark:text-[#A59DF7] border-violet-500/20 dark:border-loopnex-violetAccent/30',
    cyan: 'bg-sky-500/10 text-sky-600 dark:bg-loopnex-softCyan/15 dark:text-loopnex-softCyan border-sky-500/20 dark:border-loopnex-softCyan/30',
    amber: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/20 dark:border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-500/20 dark:border-rose-500/30',
    slate: 'bg-slate-100 text-slate-700 dark:bg-loopnex-surface dark:text-loopnex-secondaryText border-slate-200 dark:border-loopnex-surfaceBorder',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border tracking-wide uppercase',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
