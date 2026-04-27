import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Route guard component that restricts access based on auth state.
 * Demonstrates: React Router v6 route protection, conditional rendering, role-based access.
 *
 * Props:
 *   - children: The component to render if access is allowed
 *   - requireAdmin: If true, only ADMIN users can access the route
 *   - redirectTo: Where to redirect unauthorized users (default: /login)
 */
export default function ProtectedRoute({ children, requireAdmin = false, redirectTo = '/login' }) {
  const { user, loading } = useAuth();

  // Show loading spinner while auth state is being restored from localStorage
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Requires admin but user is not admin → redirect to dashboard
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Access granted → render the child component
  return children;
}
