import { forwardRef } from 'react';
import { FiCalendar } from 'react-icons/fi';

export const DatePicker = forwardRef(function DatePicker(
  {
    label,
    helperText,
    error,
    className = '',
    id,
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const dateId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={dateId} className="block text-[11px] font-medium text-stone-500 uppercase tracking-wide font-mono">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-stone-400 z-10">
          <FiCalendar className="text-sm" />
        </div>

        <input
          ref={ref}
          id={dateId}
          type="date"
          disabled={disabled}
          className={`w-full bg-[#fbf9f4] border rounded text-sm text-stone-900 transition-all duration-150 focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed pl-9 pr-3 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400'
              : 'border-[#d4d0c6] focus:border-[#292524] focus:ring-1 focus:ring-[#292524] hover:border-stone-400'
          } py-2 [color-scheme:light] ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});
