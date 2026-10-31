import React from 'react';
import { CustomerCard, CustomerCardVariant } from './CustomerCard';

interface CustomerStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: CustomerCardVariant;
  icon?: React.ReactNode;
  tag?: {
    text: string;
    type?: 'positive' | 'neutral' | 'info';
  };
  onClick?: () => void;
  className?: string;
}

export const CustomerStatCard: React.FC<CustomerStatCardProps> = ({
  title,
  value,
  subtitle,
  variant = 'default',
  icon,
  tag,
  onClick,
  className = '',
}) => {
  return (
    <CustomerCard
      variant={variant}
      padding="sm"
      hoverEffect={!!onClick}
      onClick={onClick}
      className={`flex flex-col justify-between h-full ${className}`}
    >
      {/* Top Row: Title + Tag */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {tag && (
          <span
            className={`
              text-[11px] font-semibold px-2 py-0.5 rounded-full
              ${
                tag.type === 'positive'
                  ? 'bg-emerald-100 text-emerald-800'
                  : tag.type === 'info'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-100 text-slate-700'
              }
            `}
          >
            {tag.text}
          </span>
        )}
      </div>

      {/* Bottom Row: Icon circle */}
      {icon && (
        <div className="flex items-center justify-between pt-3 mt-1">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-black/5 flex items-center justify-center text-slate-800">
            {icon}
          </div>
        </div>
      )}
    </CustomerCard>
  );
};
