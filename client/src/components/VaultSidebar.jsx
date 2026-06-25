import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export const CATEGORIES = [
  { id: 'all', label: 'All Documents', icon: 'grid' },
  { id: 'identity', label: 'Identity', icon: 'id' },
  { id: 'finance', label: 'Finance', icon: 'finance' },
  { id: 'property', label: 'Property', icon: 'property' },
  { id: 'insurance', label: 'Insurance', icon: 'insurance' },
  { id: 'legal', label: 'Legal', icon: 'legal' },
  { id: 'vehicle', label: 'Vehicle', icon: 'vehicle' },
  { id: 'medical', label: 'Medical', icon: 'medical' },
  { id: 'other', label: 'Other', icon: 'other' },
];

function CategoryIcon({ type, className }) {
  const props = { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.5 };
  switch (type) {
    case 'grid':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case 'id':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
  }
}

export default function VaultSidebar({
  category,
  onCategoryChange,
  search = '',
  onSearchChange,
  onSearchSubmit,
  onUploadClick,
}) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="flex w-full shrink-0 flex-col bg-navy md:sticky md:top-0 md:h-screen md:w-60 lg:w-64">
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/landing">
          <Logo showSubtitle />
        </Link>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="btn-primary mb-3 w-full gap-2 py-2.5 text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Upload document
          </button>
        )}
        {onSearchChange && (
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchSubmit) {
                  onSearchSubmit(search);
                }
              }}
              placeholder="Search documents…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-teal/50 focus:ring-1 focus:ring-teal/30"
            />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="section-label mb-2 px-3">Categories</p>
        <ul className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onCategoryChange(c.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  category === c.id
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <CategoryIcon type={c.icon} className="h-4 w-4 shrink-0" />
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 text-xs font-semibold text-teal">
            {user?.phone?.slice(-2) || '??'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/90">+91 {user?.phone}</p>
            <Link
              to="/subscription"
              className="text-xs text-teal-light transition hover:text-teal hover:underline"
            >
              {(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)} plan · Upgrade
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
