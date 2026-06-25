import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthEntry from './components/AuthEntry';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DocDetail from './pages/DocDetail';
import Subscription from './pages/Subscription';

function AppLayout() {
  const location = useLocation();
  const isVaultArea =
    location.pathname.startsWith('/vault') ||
    location.pathname.startsWith('/doc') ||
    location.pathname === '/subscription';
  const isLanding = location.pathname === '/landing';
  const isAuth = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div
      className={
        isVaultArea || isLanding
          ? 'min-h-screen bg-surface text-navy'
          : isAuth
            ? 'min-h-screen bg-[#e8eaed] text-navy'
            : ''
      }
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthEntry />} />
        <Route path="/auth" element={<AuthEntry />} />
        <Route path="/auth/" element={<Navigate to="/auth" replace />} />
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doc/:id"
          element={
            <ProtectedRoute>
              <DocDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
