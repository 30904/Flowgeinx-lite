import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-white/10 bg-navy-dark/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-teal">Flow</span>genix Lite
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/vault" className="text-sm text-white/80 hover:text-teal">
                My Vault
              </Link>
              <span className="text-sm text-white/50">{user?.phone}</span>
              <button type="button" onClick={handleLogout} className="btn-outline text-sm py-2 px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-primary text-sm py-2 px-4">
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
