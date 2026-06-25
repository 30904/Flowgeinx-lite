import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8eaed] text-gray-500">
        Loading…
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/landing' : '/auth'} replace />;
}
