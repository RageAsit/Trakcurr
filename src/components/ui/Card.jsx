export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-stone-300 rounded-lg shadow-xs transition-all duration-200 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', border = false, variant = 'dark', ...props }) {
  const isDark = variant === 'dark';
  const isPaper = variant === 'paper' || variant === 'light';

  const baseClasses = isDark
    ? 'bg-[#111111] text-stone-100 px-4.5 py-3 border-b border-stone-800 flex items-center justify-between'
    : isPaper
    ? 'bg-[#f6f4ee] text-stone-900 px-4.5 py-3 border-b border-stone-300 flex items-center justify-between'
    : `p-4.5 flex items-center justify-between ${border ? 'border-b border-stone-200' : ''}`;

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', dark = true, icon: Icon, iconColor = 'text-amber-400', ...props }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className={`text-sm shrink-0 ${iconColor}`} />}
      <h3
        className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider font-display leading-none ${
          dark ? 'text-stone-100' : 'text-stone-900'
        } ${className}`}
        {...props}
      >
        {children}
      </h3>
    </div>
  );
}

export function CardDescription({ children, className = '', dark = true, ...props }) {
  return (
    <p
      className={`text-[11px] font-mono leading-relaxed ${
        dark ? 'text-stone-400' : 'text-stone-600'
      } ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', border = true, ...props }) {
  return (
    <div
      className={`px-4.5 py-3 flex items-center justify-between bg-[#f6f4ee] ${
        border ? 'border-t border-stone-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
