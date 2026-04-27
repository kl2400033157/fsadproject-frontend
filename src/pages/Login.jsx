import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const userData = res.data.user || res.data;
      // Store user token — always clear adminToken to prevent bleed-through
      localStorage.removeItem('adminToken');
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      } else if (userData.id) {
        localStorage.setItem('token', userData.id.toString());
      }
      login(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      const role = userData.role;
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card glass animate-fade-in shadow-xl">
        <div className="auth-header">
          <span className="auth-icon" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}>🔐</span>
          <h1 className="gradient-text">Welcome Back</h1>
          <p>Sign in to your LearnHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit w-full"
            id="login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" id="link-to-register" className="font-semibold text-primary">Create one</Link>
        </p>
      </div>
    </div>
  );
}
