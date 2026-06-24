import { Link } from 'react-router-dom';
import Logo from './Logo';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { id: 'overview', label: 'Overview', icon: 'dashboard' },
      { id: 'features', label: 'Features', icon: 'sparkles' },
    ],
  },
  {
    label: 'Product',
    items: [
      { id: 'upload', label: 'Upload & Organize', icon: 'upload' },
      { id: 'reminders', label: 'Expiry Reminders', icon: 'bell' },
      { id: 'ai', label: 'Ask AI', icon: 'chat' },
    ],
  },
  {
    label: 'Get Started',
    items: [
      { id: 'auth', label: 'Sign in', icon: 'login', href: '/auth' },
      { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', href: 'https://wa.me/919876543210', external: true },
    ],
  },
];

function NavIcon({ type, className }) {
  const props = {
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.5,
  };

  switch (type) {
    case 'dashboard':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      );
    case 'upload':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    case 'login':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m2.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m2.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.75c0 .621.504 1.125 1.125 1.125h15.75c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875v11.25z" />
        </svg>
      );
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingSidebar({ activeSection, onSectionChange }) {
  const handleNav = (item) => {
    if (item.href) return;
    onSectionChange?.(item.id);
    scrollToSection(item.id);
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-navy lg:flex lg:w-64">
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/">
          <Logo showSubtitle />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="section-label mb-2 px-3">{section.label}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = !item.href && activeSection === item.id;
                const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`;

                if (item.href) {
                  if (item.external) {
                    return (
                      <li key={item.id}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          <NavIcon type={item.icon} className="h-4 w-4 shrink-0" />
                          {item.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={item.id}>
                      <Link to={item.href} className={className}>
                        <NavIcon type={item.icon} className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button type="button" onClick={() => handleNav(item)} className={className}>
                      <NavIcon type={item.icon} className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <Link to="/auth" className="btn-primary w-full text-sm">
          Get Started Free
        </Link>
      </div>
    </aside>
  );
}
