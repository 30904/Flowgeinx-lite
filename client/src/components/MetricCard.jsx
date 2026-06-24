import { Link } from 'react-router-dom';

function Sparkline({ color, points }) {
  const path = points
    .map((y, i) => {
      const x = (i / (points.length - 1)) * 56;
      const py = 20 - y * 16;
      return `${i === 0 ? 'M' : 'L'}${x},${py}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function MetricCard({
  label,
  sublabel,
  value,
  trend,
  trendUp = true,
  icon,
  iconBg,
  sparkColor,
  sparkPoints,
  onClick,
  to,
  href,
}) {
  const content = (
    <>
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {sublabel}
        </span>
      </div>

      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mb-3 text-2xl font-bold text-navy transition-colors duration-300 group-hover:text-teal-dark">
        {value}
      </p>

      <div className="flex items-end justify-between border-t border-gray-100 pt-3">
        <span
          className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}
        >
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <Sparkline color={sparkColor} points={sparkPoints} />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-teal/0 to-teal/0 opacity-0 transition-opacity duration-300 group-hover:from-teal/5 group-hover:to-transparent group-hover:opacity-100" />
    </>
  );

  const className =
    'card-interactive group relative cursor-pointer overflow-hidden text-left';

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
