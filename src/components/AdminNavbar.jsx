import { Bell, Menu, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/webinars': 'Webinars',
  '/admin/resources': 'Resources',
  '/admin/users': 'Users',
};

const AdminNavbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin';

  return (
    <header className="adm-topbar">
      <div className="adm-topbar-left">
        <button className="adm-icon-btn" onClick={toggleSidebar} title="Toggle sidebar">
          <Menu size={20} />
        </button>
        <span className="adm-page-title-bar">{title}</span>
      </div>

      <div className="adm-topbar-right">
        <button className="adm-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="adm-notif-dot" />
        </button>

        <div className="adm-divider" />

        <button className="adm-profile-btn">
          <div className="adm-avatar">
            {user?.name?.charAt(0) || <User size={14} />}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="adm-profile-name">{user?.name || 'Admin'}</div>
            <div className="adm-profile-role">Administrator</div>
          </div>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
