import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async () => {
    if (!form.email || !form.email.includes('@')) {
      toast.error('Please enter a valid email address first.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await authAPI.requestOtp(form.email);
      setOtpSent(true);
      toast.success(res.data || 'OTP sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) return;

    if (!form.name || !form.email || !form.password || !form.otp) {
      toast.error('All required fields including OTP must be filled.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const res = await authAPI.register(data);
      const userData = res.data.user || res.data;

      // Clear any admin session and store the new user token
      localStorage.removeItem('adminToken');
      const token = res.data.token || userData.id?.toString();
      if (token) localStorage.setItem('token', token);

      login(userData);
      toast.success('Account created! Welcome to LearnHub.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card glass animate-fade-in shadow-xl">
        <div className="auth-header">
          <span className="auth-icon" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}>🚀</span>
          <h1 className="gradient-text">Join LearnHub</h1>
          <p>Create your free account today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name *</label>
            <input
              type="text"
              id="reg-name"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={otpSent}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="email"
                id="reg-email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={otpSent}
                style={{ flex: 1 }}
              />
              {!otpSent && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleRequestOtp}
                  disabled={loading || !form.email}
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </button>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password *</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                disabled={!otpSent}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">Confirm Password *</label>
              <input
                type="password"
                id="reg-confirm-password"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                disabled={!otpSent}
              />
            </div>
          </div>

          {otpSent && (
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="reg-otp">Verification Code (OTP) *</label>
                <input
                  type="text"
                  id="reg-otp"
                  name="otp"
                  className="form-input"
                  placeholder="Enter 6-digit OTP sent to your email"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }}
                />
              </div>
            </div>
          )}

          {otpSent && (
            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit w-full mt-4"
              id="register-submit"
              disabled={loading}
            >
              {loading ? 'Verifying & Creating Account...' : 'Verify OTP & Make Account'}
            </button>
          )}
        </form>

        <p className="auth-footer mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" id="link-to-login" className="font-semibold text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
