import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

export const AdminToast: React.FC = () => {
  const { toasts, dismissToast } = useAdminData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
        }[toast.type];

        const borderBg = {
          success: 'bg-white border-emerald-200 shadow-emerald-500/5',
          error: 'bg-white border-rose-200 shadow-rose-500/5',
          info: 'bg-white border-sky-200 shadow-sky-500/5',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg
              transition-all duration-200 animate-in slide-in-from-top-4 fade-in
              ${borderBg}
            `}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <p className="text-sm font-medium text-slate-800">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
