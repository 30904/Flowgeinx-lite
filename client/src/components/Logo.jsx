export default function Logo({ className = '', showSubtitle = false, variant = 'light' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-navy';
  const subColor = variant === 'light' ? 'text-teal' : 'text-teal-dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/15 ring-1 ring-teal/30">
        <svg className="h-5 w-5 text-teal" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 18V6h3l3 6 3-6h3v12h-2.5V9.5L13.5 18h-1.5l-1.5-8.5V18H6z"
            fill="currentColor"
          />
          <path
            d="M4 4h16v2H4V4zm0 14h16v2H4v-2z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </div>
      <div>
        <span className={`text-lg font-bold leading-tight ${textColor}`}>
          Flow<span className="text-teal">genix</span> Lite
        </span>
        {showSubtitle && (
          <p className={`text-[11px] font-medium leading-tight ${subColor}`}>
            AI Document Platform
          </p>
        )}
      </div>
    </div>
  );
}
