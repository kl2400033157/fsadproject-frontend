import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Video, FileText, Users, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ open }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const links = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', end: true },
    { label: 'Webinars', icon: Video, to: '/admin/webinars' },
    { label: 'Resources', icon: FileText, to: '/admin/resources' },
    { label: 'Users', icon: Users, to: '/admin/users' },
  ];

  return (
    <aside className={`adm-sidebar${open ? ' open' : ''}`}>
      {/* Brand */}
      <div className="adm-sidebar-brand">
        <div className="adm-brand-icon">
          <ShieldCheck size={20} color="#fff" />
        </div>
        <div>
          <div className="adm-brand-name">LearnHub</div>
          <div className="adm-brand-badge">Admin Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="adm-nav">
        <div className="adm-nav-section-label">Main Menu</div>
        {links.map(({ label, icon: Icon, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} className="adm-nav-icon" />
            <span className="adm-nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="adm-sidebar-footer">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '8px' }}>
            <div className="adm-avatar">{user.name?.charAt(0) || 'A'}</div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.email}</div>
            </div>
          </div>
        )}
        <button className="adm-nav-link" onClick={handleLogout} style={{ color: '#f87171' }}>
          <LogOut size={18} className="adm-nav-icon" />
          <span className="adm-nav-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
