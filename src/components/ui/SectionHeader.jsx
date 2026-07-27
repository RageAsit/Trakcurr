export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 ledger-header-rule ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-md bg-[#111111] text-stone-100 border border-stone-800 shrink-0 shadow-xs">
            <Icon className="text-base" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-stone-900 font-display leading-none">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111] text-stone-100 border border-stone-800">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-stone-600 font-mono mt-1 leading-none">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">{actions}</div>}
    </div>
  );
}
