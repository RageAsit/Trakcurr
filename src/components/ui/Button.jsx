import { forwardRef } from 'react';
import { CgSpinner } from 'react-icons/cg';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider rounded-md transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-stone-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[10px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-xs gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#111111] hover:bg-[#27272a] text-stone-50 border border-[#111111] shadow-xs font-mono font-bold uppercase tracking-wider',
    secondary:
      'bg-[#f6f4ee] hover:bg-stone-200 text-stone-900 border border-stone-400 shadow-xs font-mono font-bold uppercase tracking-wider',
    danger:
      'bg-rose-800 hover:bg-rose-900 text-white border border-rose-900 shadow-xs font-mono font-bold uppercase tracking-wider',
    ghost:
      'bg-transparent hover:bg-stone-200/70 text-stone-800 border border-transparent font-mono font-bold uppercase tracking-wider',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <CgSpinner className="animate-spin text-current text-base" />
      ) : LeftIcon ? (
        <LeftIcon className="text-current text-sm shrink-0" />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon ? <RightIcon className="text-current text-sm shrink-0" /> : null}
    </button>
  );
});

export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}
