import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Auth from '../pages/Auth';

export default function AuthEntry() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8eaed] text-gray-500">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <Auth key="sign-in" />;
}
