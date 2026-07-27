import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    id,
    type = 'text',
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const hasLeftPrefix = Boolean(LeftIcon);
  const isLeftString = typeof LeftIcon === 'string';

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {hasLeftPrefix && (
          <div className="absolute left-3 pointer-events-none text-stone-500 flex items-center justify-center min-w-[18px]">
            {isLeftString ? (
              <span className="font-mono font-bold text-stone-800 text-xs select-none">{LeftIcon}</span>
            ) : (
              <LeftIcon className="text-sm" />
            )}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full bg-[#fbf9f4] border rounded-md text-xs font-mono text-stone-900 placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
            hasLeftPrefix ? 'pl-9' : 'pl-3'
          } ${RightIcon ? 'pr-9' : 'pr-3'} ${
            error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
              : 'border-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 hover:border-stone-600'
          } py-2 ${className}`}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 pointer-events-none text-stone-400">
            <RightIcon className="text-sm" />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});
