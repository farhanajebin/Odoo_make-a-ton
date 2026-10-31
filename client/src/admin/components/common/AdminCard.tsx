import React from 'react';

export type CardVariant = 'default' | 'sky' | 'lavender' | 'mint' | 'amber' | 'dark';

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border-slate-200/80 text-slate-900 shadow-sm',
  sky: 'bg-[#EEF6FF] border-[#D5E7FC] text-slate-900 shadow-sm',
  lavender: 'bg-[#F4EFFF] border-[#E7DBFF] text-slate-900 shadow-sm',
  mint: 'bg-[#EDF8F2] border-[#D4F4E2] text-slate-900 shadow-sm',
  amber: 'bg-[#FFF9EE] border-[#FDEBC8] text-slate-900 shadow-sm',
  dark: 'bg-[#151922] border-slate-800 text-white shadow-md',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const AdminCard: React.FC<AdminCardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverEffect = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl border transition-all duration-200
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
