import { forwardRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    helperText,
    error,
    leftIcon: LeftIcon,
    className = '',
    id,
    disabled = false,
    required = false,
    children,
    placeholder = 'Select an option...',
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 pointer-events-none text-stone-500 z-10">
            <LeftIcon className="text-sm" />
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none bg-[#fbf9f4] border rounded-md text-xs font-mono text-stone-900 placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
            LeftIcon ? 'pl-9' : 'pl-3'
          } pr-9 ${
            error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
              : 'border-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 hover:border-stone-600'
          } py-2 ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-white text-stone-400">
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={typeof opt === 'object' ? opt.value : opt}
                  value={typeof opt === 'object' ? opt.value : opt}
                  className="bg-white text-stone-900"
                >
                  {typeof opt === 'object' ? opt.label : opt}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3 pointer-events-none text-stone-400">
          <FiChevronDown className="text-sm" />
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});
