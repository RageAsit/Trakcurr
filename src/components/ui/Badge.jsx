export function Badge({
  children,
  variant = 'default',
  size = 'md',
  showDot = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-0.5 text-[10px] gap-1',
  };

  const variantClasses = {
    default: 'bg-stone-100 text-stone-700 border border-stone-200',
    credit: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    debit: 'bg-rose-50 text-rose-800 border border-rose-200',
    muted: 'bg-stone-50 text-stone-500 border border-stone-200',
    // Legacy mappings for backward compatibility
    indigo: 'bg-stone-100 text-stone-700 border border-stone-200',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200',
    slate: 'bg-stone-50 text-stone-600 border border-stone-200',
    violet: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  };

  const dotColorClasses = {
    default: 'bg-stone-500',
    credit: 'bg-emerald-600',
    debit: 'bg-rose-600',
    muted: 'bg-stone-400',
    indigo: 'bg-stone-500',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    slate: 'bg-stone-400',
    violet: 'bg-indigo-600',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wide rounded select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColorClasses[variant] || dotColorClasses.default
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
