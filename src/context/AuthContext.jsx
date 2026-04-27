import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — Context API for global authentication state.
 * Demonstrates: React Context API, useContext hook, localStorage/sessionStorage.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('learnhub_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('learnhub_user');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('learnhub_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('learnhub_user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isLoggedIn = () => !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
