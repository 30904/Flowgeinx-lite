export default function PlanCard({
  name,
  priceLabel,
  period,
  features,
  highlighted,
  isCurrent,
  ctaLabel,
  onSelect,
  loading,
  disabled,
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition ${
        highlighted
          ? 'border-teal bg-white shadow-lg shadow-teal/10 ring-1 ring-teal/20'
          : 'border-gray-100 bg-white'
      } ${isCurrent ? 'ring-2 ring-navy/20' : ''}`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal px-3 py-0.5 text-xs font-semibold text-navy">
          Most popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute right-4 top-4 rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-medium text-navy">
          Current
        </span>
      )}

      <h3 className="text-lg font-bold text-navy">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-navy">{priceLabel}</span>
        {period && <span className="text-sm text-gray-500">{period}</span>}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled || loading}
        className={`mt-8 w-full py-2.5 text-sm font-semibold ${
          isCurrent
            ? 'cursor-default rounded-lg border border-gray-200 bg-gray-50 text-gray-400'
            : highlighted
              ? 'btn-primary'
              : 'btn-outline border-navy/20 text-navy hover:bg-navy/5'
        }`}
      >
        {loading ? 'Opening checkout…' : ctaLabel}
      </button>
    </div>
  );
}
