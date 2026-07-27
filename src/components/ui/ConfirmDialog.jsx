import { FiAlertTriangle, FiInfo, FiTrash2 } from 'react-icons/fi';
import { Modal } from './Modal';
import { Button, SecondaryButton } from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const iconVariants = {
    danger: { icon: FiTrash2, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    warning: { icon: FiAlertTriangle, color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    primary: { icon: FiInfo, color: 'text-stone-900', bg: 'bg-stone-100 border-stone-300' },
  };

  const currentVariant = iconVariants[variant] || iconVariants.danger;
  const Icon = currentVariant.icon;

  const footer = (
    <>
      <SecondaryButton onClick={onClose} isDisabled={isLoading}>
        {cancelText}
      </SecondaryButton>
      <Button
        variant={variant === 'warning' ? 'primary' : variant}
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={footer}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg border ${currentVariant.bg} shrink-0`}>
          <Icon className={`text-xl ${currentVariant.color}`} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 font-display">{title}</h3>
          <p className="text-xs text-stone-600 font-mono leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
