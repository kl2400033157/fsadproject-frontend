import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.svg';
import './Navbar.css';

/**
 * Navigation bar component with glassmorphism styling.
 * Shows different links based on auth state and role.
 */
export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <img src={logo} alt="LearnHub" style={{ height: '55px', maxWidth: '280px', objectFit: 'contain', overflow: 'visible' }} />
        </Link>

        <button
          className="navbar-toggle"
          id="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${mobileOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" id="nav-home" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <Link to="/webinars" className="nav-link" id="nav-webinars" onClick={() => setMobileOpen(false)}>
            Webinars
          </Link>

          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label="Toggle dark mode"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              {!isAdmin() && (
                <Link to="/my-webinars" className="nav-link" id="nav-my-webinars" onClick={() => setMobileOpen(false)}>
                  My Webinars
                </Link>
              )}
              <Link
                to={isAdmin() ? '/admin' : '/dashboard'}
                className="nav-link"
                id="nav-dashboard"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <div className="nav-user">
                <span className="nav-user-name">{user.name}</span>
                <span className={`nav-role-badge ${isAdmin() ? 'admin' : 'user'}`}>
                  {user.role}
                </span>
                <button className="btn btn-outline btn-sm" id="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth d-flex gap-3 align-items-center">
              <Link to="/login" className="btn btn-primary btn-sm px-4" id="nav-login-student" onClick={() => setMobileOpen(false)}>
                Student Login
              </Link>
              <Link to="/admin-login" className="btn btn-outline btn-sm px-3 d-flex align-items-center gap-1" id="nav-login-admin" onClick={() => setMobileOpen(false)}>
                <span>🛡️</span> Admin Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
