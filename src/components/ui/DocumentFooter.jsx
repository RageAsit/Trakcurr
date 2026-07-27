export function DocumentFooter({
  docRef = 'TC-FIN-2026',
  pageNumber = '1 OF 1',
  className = '',
}) {
  return (
    <div className={`pt-6 mt-8 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-stone-500 uppercase tracking-wider select-none ${className}`}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-stone-900" />
        <span className="font-bold text-stone-700">CONFIDENTIAL FINANCIAL RECORD</span>
        <span className="text-stone-400">|</span>
        <span>{docRef}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>PREPARED BY TRAKCURR PORTFOLIO ENGINE</span>
        <span className="text-stone-400">|</span>
        <span className="font-bold text-stone-800">PAGE {pageNumber}</span>
      </div>
    </div>
  );
}
