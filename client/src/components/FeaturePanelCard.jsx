export default function FeaturePanelCard({
  title,
  description,
  icon,
  iconBg,
  accentColor = 'teal',
  children,
  onClick,
  className = '',
}) {
  const accentBorder = {
    teal: 'group-hover:border-teal/40',
    blue: 'group-hover:border-blue-400/40',
    violet: 'group-hover:border-violet-400/40',
    orange: 'group-hover:border-orange-400/40',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-interactive group relative w-full overflow-hidden p-0 text-left ${accentBorder[accentColor] || accentBorder.teal} ${className}`}
    >
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-navy transition-colors duration-300 group-hover:text-teal-dark">
              {title}
            </h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-teal/0 to-teal/0 opacity-0 transition-opacity duration-300 group-hover:from-teal/[0.03] group-hover:to-transparent group-hover:opacity-100" />
    </button>
  );
}
