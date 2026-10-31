import React from 'react';
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminCard, CardVariant } from './AdminCard';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: CardVariant;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onOptionsClick?: () => void;
  className?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  variant = 'default',
  icon,
  trend,
  onOptionsClick,
  className = '',
}) => {
  return (
    <AdminCard variant={variant} padding="sm" className={`flex flex-col justify-between h-full ${className}`}>
      {/* Top Row: Title + Option button */}
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
        {onOptionsClick && (
          <button
            onClick={onOptionsClick}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom Row: Icon circle + Trend Badge */}
      {(icon || trend) && (
        <div className="flex items-center justify-between pt-4 mt-2">
          {icon ? (
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-black/5 flex items-center justify-center text-slate-800">
              {icon}
            </div>
          ) : <div />}

          {trend && (
            <span
              className={`
                inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                ${
                  trend.isPositive !== false
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'bg-rose-100/80 text-rose-800'
                }
              `}
            >
              {trend.isPositive !== false ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </AdminCard>
  );
};
