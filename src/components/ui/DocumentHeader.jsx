import { useAuth } from '../../context/AuthContext';

export function DocumentHeader({
  docType = 'FINANCIAL STATEMENT',
  docRef = 'DOC-2026-07',
  title,
  subtitle,
  icon: Icon,
  period,
  actions,
  className = '',
}) {
  const { user } = useAuth();
  const userEmail = user?.email || 'authenticated.user@trakcurr.internal';

  return (
    <div className={`space-y-4 pb-4 border-b-2 border-stone-900 ${className}`}>
      {/* Official Document Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 bg-[#f6f4ee] px-3.5 py-2 rounded-md border border-stone-300">
        <div className="flex items-center gap-3">
          <span className="text-stone-900 font-extrabold bg-stone-200 px-2 py-0.5 rounded border border-stone-400">
            {docType}
          </span>
          <span className="text-stone-600">REF: {docRef}</span>
        </div>
        <div className="flex items-center gap-4 text-stone-600">
          {period && <span>PERIOD: <strong className="text-stone-900">{period}</strong></span>}
          <span className="hidden sm:inline">PREPARED FOR: <strong className="text-stone-900 truncate max-w-[180px]">{userEmail}</strong></span>
          <span className="hidden md:inline text-emerald-800 font-extrabold">• STATUS: VERIFIED</span>
        </div>
      </div>

      {/* Main Document Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div className="p-3 rounded-lg bg-[#111111] text-stone-100 border border-stone-800 shrink-0 shadow-xs">
              <Icon className="text-lg" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-stone-900 font-display leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-stone-600 font-mono mt-1.5 leading-none">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">{actions}</div>}
      </div>
    </div>
  );
}
