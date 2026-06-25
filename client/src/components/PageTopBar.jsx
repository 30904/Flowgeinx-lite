import UserMenu from './UserMenu';

const HELP_URL = 'https://wa.me/919876543210';

export default function PageTopBar({ compact = false }) {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <a
        href={HELP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-teal/40 hover:bg-teal/5 hover:text-teal-dark"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        {!compact && <span>Help Center</span>}
      </a>
      <UserMenu />
    </div>
  );
}
