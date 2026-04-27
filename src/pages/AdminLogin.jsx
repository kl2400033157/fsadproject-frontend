import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validMFACodes = ['1001', '1002', '1003', '1004', '1005', '1006'];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const attemptLogin = async () => {
      try {
        const response = await authAPI.login({ email, password });
        const data = response.data;

        if (data.user.role === 'ADMIN' || data.user.role === 'ROLE_ADMIN') {
          setTempUserData({ ...data.user, token: data.token });
          setStep(2);
          setLoading(false);
        } else {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
        }
      } catch (err) {
        if (err.code === 'ERR_NETWORK') {
          setError('Server is waking up, please wait...');
          setTimeout(attemptLogin, 5000);
        } else {
          setError(err.response?.data?.message || 'Invalid admin credentials');
          setLoading(false);
        }
      }
    };

    attemptLogin();
  };

  const handleMFASubmit = (e) => {
    if (e) e.preventDefault();
    setError('');
    
    if (validMFACodes.includes(mfaCode)) {
      // Clear regular user token to prevent bleed-through
      localStorage.removeItem('token');
      if (tempUserData?.token) {
        localStorage.setItem('adminToken', tempUserData.token);
      } else if (tempUserData?.id) {
        localStorage.setItem('adminToken', tempUserData.id.toString());
      }
      login(tempUserData);
      navigate('/admin');
    } else {
      setError('Invalid MFA code');
    }
  };

  const s = {
    page: {
      background: 'radial-gradient(ellipse at 40% 20%, #1a0d3d 0%, #0d0d1a 60%, #000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      width: '100%',
      maxWidth: '440px',
      padding: '48px 40px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(167,139,250,0.2)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.05) inset',
      backdropFilter: 'blur(20px)',
    },
    header: { textAlign: 'center', marginBottom: '36px' },
    iconWrapper: { position: 'relative', display: 'inline-block', marginBottom: '20px', color: '#7c3aed' },
    lockBadge: {
      position: 'absolute', bottom: '-2px', right: '-6px',
      background: '#10b981', borderRadius: '50%', padding: '3px', color: '#fff', display: 'flex',
    },
    h1: { color: '#c4b5fd', fontSize: '1.65rem', fontWeight: '700', margin: '0 0 6px', letterSpacing: '-0.3px' },
    sub: { color: '#6b7280', fontSize: '0.875rem', margin: 0 },
    errorBanner: {
      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '10px', color: '#f87171', fontSize: '0.875rem', marginBottom: '20px',
    },
    formGroup: { marginBottom: '20px' },
    label: {
      display: 'block', color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600',
      marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '14px', color: '#6b7280', pointerEvents: 'none', zIndex: 1 },
    input: {
      width: '100%', padding: '12px 14px 12px 42px',
      background: 'rgba(20,10,50,0.8)',
      border: '1px solid rgba(167,139,250,0.25)',
      borderRadius: '10px', color: '#e5e7eb', fontSize: '0.95rem',
      outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    btn: {
      width: '100%', padding: '14px',
      background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700',
      fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.02em',
      transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    },
    backLink: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      marginTop: '28px', color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none',
    },
  };

  return (
    <div style={s.page}>
      <style>{`
        .admin-input:-webkit-autofill,
        .admin-input:-webkit-autofill:hover,
        .admin-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(20,10,50,1) inset !important;
          -webkit-text-fill-color: #e5e7eb !important;
          border-color: rgba(167,139,250,0.4) !important;
          caret-color: #e5e7eb;
          transition: background-color 5000s ease-in-out 0s;
        }
        .admin-input:focus {
          border-color: rgba(167,139,250,0.6) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
        }
        .admin-input::placeholder { color: #4b5563; }
        .admin-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(124,58,237,0.5) !important;
        }
        .admin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin-back-link:hover { color: #a78bfa !important; }
      `}</style>

      <div style={s.card}>
        <div style={s.header}>
          <div style={s.iconWrapper}>
            <Shield size={52} />
            <span style={s.lockBadge}><Lock size={13} /></span>
          </div>
          <h1 style={s.h1}>LearnHub Admin</h1>
          <p style={s.sub}>{step === 1 ? 'Authorized Personnel Only' : 'MFA Verification'}</p>
        </div>

        {error && (
          <div style={s.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div style={s.formGroup}>
              <label style={s.label}>Administrator Email</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}><Mail size={17} /></span>
                <input
                  className="admin-input" type="email" placeholder="Enter admin email"
                  value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} required
                />
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Security Password</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}><Lock size={17} /></span>
                <input
                  className="admin-input" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} required
                />
              </div>
            </div>
            <button type="submit" className="admin-btn" style={s.btn} disabled={loading}>
              {loading ? 'Verifying...' : 'Access Admin Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMFASubmit}>
            <div style={s.formGroup}>
              <label style={s.label}>4-Digit MFA Code</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}><Shield size={17} /></span>
                <input
                  className="admin-input" type="text" maxLength="4" placeholder="0 0 0 0"
                  value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  style={{ ...s.input, textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' }}
                  required autoFocus
                />
              </div>
            </div>
            <button type="submit" className="admin-btn" style={s.btn}>Verify & Enter</button>
            <button
              type="button" onClick={() => setStep(1)}
              style={{ ...s.btn, background: 'transparent', boxShadow: 'none', color: '#6b7280', marginTop: '10px' }}
            >
              ← Back to Login
            </button>
          </form>
        )}

        <Link to="/" className="admin-back-link" style={s.backLink}>
          <ArrowLeft size={15} /><span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
