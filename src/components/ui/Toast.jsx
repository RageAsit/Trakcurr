import { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export function Toast({
  isOpen,
  onClose,
  message,
  type = 'success',
  autoHideDuration = 3000,
}) {
  useEffect(() => {
    if (isOpen && autoHideDuration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoHideDuration, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: FiCheckCircle,
      bg: 'bg-stone-900 border-stone-800 text-stone-100',
      iconColor: 'text-emerald-400',
    },
    error: {
      icon: FiAlertCircle,
      bg: 'bg-stone-900 border-stone-800 text-stone-100',
      iconColor: 'text-rose-400',
    },
    info: {
      icon: FiInfo,
      bg: 'bg-stone-900 border-stone-800 text-stone-100',
      iconColor: 'text-amber-400',
    },
  };

  const currentType = typeConfig[type] || typeConfig.success;
  const Icon = currentType.icon;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-page-enter"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl max-w-sm ${currentType.bg}`}
      >
        <Icon className={`text-lg shrink-0 ${currentType.iconColor}`} />
        <span className="text-xs font-mono font-bold text-stone-100 leading-snug">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors ml-1 shrink-0"
            aria-label="Close notification"
          >
            <FiX className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
}
