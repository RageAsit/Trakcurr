import { forwardRef } from 'react';

export const TextArea = forwardRef(function TextArea(
  {
    label,
    helperText,
    error,
    rows = 3,
    resizable = true,
    className = '',
    id,
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={areaId} className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider font-mono">
          {label}
          {required && <span className="text-rose-600 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-[#fbf9f4] border rounded-lg text-sm text-stone-900 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 ${
          resizable ? 'resize-y' : 'resize-none'
        } ${
          error
            ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
            : 'border-[#d8d4c8] focus:border-stone-900 focus:ring-1 focus:ring-stone-900 hover:border-stone-400'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});
