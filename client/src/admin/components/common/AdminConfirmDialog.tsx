import React from 'react';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import { AdminModal } from './AdminModal';
import { AdminButton } from './AdminButton';

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) => {
  const icon = {
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <HelpCircle className="w-6 h-6 text-sky-600" />,
  }[type];

  const iconBg = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-sky-50 border-sky-100',
  }[type];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="sm"
      footer={
        <>
          <AdminButton variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </AdminButton>
          <AdminButton
            variant={type === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </AdminButton>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${iconBg}`}>
          {icon}
        </div>
        <h4 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
      </div>
    </AdminModal>
  );
};
