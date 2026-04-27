import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../pages/Admin.css';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#08090e', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.08)',
          borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
          Verifying credentials...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="adm-layout">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 150
          }}
        />
      )}

      <AdminSidebar open={sidebarOpen} />

      <div className="adm-main">
        <AdminNavbar toggleSidebar={() => setSidebarOpen(v => !v)} />
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
