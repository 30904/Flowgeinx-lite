import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isVault = location.pathname.startsWith('/vault');
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/auth';

  if (isVault || isLanding || isAuth) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/vault"
                className="hidden text-sm text-white/80 transition hover:text-teal sm:inline"
              >
                My Vault
              </Link>
              <span className="hidden text-sm text-white/40 sm:inline">+91 {user?.phone}</span>
              <Link to="/vault" className="btn-primary text-sm sm:hidden">
                Vault
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-outline hidden py-2 text-sm sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary py-2 text-sm">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
