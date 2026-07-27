import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => closeOnOverlayClick && onClose && onClose()}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full bg-white border border-stone-200 rounded-lg shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 ${
          sizeClasses[size] || sizeClasses.md
        } ${className}`}
      >
        {/* Header — Black Title Strip */}
        <div className="px-5 py-3.5 bg-stone-900 text-stone-100 border-b border-stone-800 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-100 font-display">{title}</h2>}
            {subtitle && <p className="text-[11px] text-stone-400 font-mono mt-0.5">{subtitle}</p>}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors -mr-1 -mt-1"
              aria-label="Close modal"
            >
              <FiX className="text-base" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[#eeebe3] bg-[#fbf9f4] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
