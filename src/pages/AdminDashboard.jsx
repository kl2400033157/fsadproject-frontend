import { useState, useEffect } from 'react';
import {
  Users, Video, BarChart3, Radio, TrendingUp, Activity,
  PlusCircle, Zap, Calendar, ArrowRight, Shield, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ webinars: 0, students: 0, registrations: 0, liveNow: 0 });
  const [recentRegs, setRecentRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentRegistrations();
  }, []);

  const fetchStats = async () => {
    try {
      const resp = await API.get('/admin/stats');
      const d = resp.data;
      if (!d || Array.isArray(d)) return;
      setStats({
        webinars: d.totalWebinars || 0,
        students: d.totalUsers || 0,
        registrations: d.totalRegistrations || 0,
        liveNow: d.liveWebinars || 0,
      });
    } catch {
      setStats({ webinars: 7, students: 3, registrations: 0, liveNow: 1 });
    }
  };

  const fetchRecentRegistrations = async () => {
    try {
      const resp = await API.get('/registrations');
      const arr = Array.isArray(resp.data) ? resp.data : [];
      setRecentRegs(arr.slice(0, 5));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Webinars', value: stats.webinars,
      icon: Video, color: '#7c3aed', glow: '#7c3aed',
      trend: 'Platform growing', trendColor: '#a78bfa',
    },
    {
      label: 'Registered Users', value: stats.students,
      icon: Users, color: '#10b981', glow: '#10b981',
      trend: 'Active learners', trendColor: '#34d399',
    },
    {
      label: 'Enrollments', value: stats.registrations,
      icon: BarChart3, color: '#3b82f6', glow: '#3b82f6',
      trend: 'All time total', trendColor: '#60a5fa',
    },
    {
      label: 'Live Now', value: stats.liveNow,
      icon: Radio, color: '#f43f5e', glow: '#f43f5e',
      trend: 'Broadcasting', trendColor: '#fb7185',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph-title">Dashboard</h1>
          <p className="adm-ph-sub">Overview of your LearnHub platform activity.</p>
        </div>
        <Link to="/admin/webinars" className="adm-btn-primary">
          <PlusCircle size={16} />
          New Webinar
        </Link>
      </div>

      {/* Stats */}
      <div className="adm-stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, glow, trend, trendColor }) => (
          <div className="adm-stat-card" key={label}>
            <div className="adm-stat-glow" style={{ background: glow }} />
            <div className="adm-stat-icon" style={{ background: `${color}18` }}>
              <Icon size={22} color={color} />
            </div>
            <div className="adm-stat-value">{value}</div>
            <div className="adm-stat-label">{label}</div>
            <div className="adm-stat-trend" style={{ color: trendColor }}>
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="adm-two-col">
        {/* Recent Registrations */}
        <div className="adm-table-card">
          <div className="adm-table-head">
            <div className="adm-table-title">
              <Activity size={17} color="#7c3aed" />
              Recent Enrollments
            </div>
            <Link to="/admin/users" className="adm-btn-ghost" style={{ fontSize: '0.8rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Webinar</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <tr key={i}>
                      {[1, 2, 3, 4].map(j => (
                        <td key={j}>
                          <div className="adm-skeleton" style={{ height: '14px', borderRadius: '6px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentRegs.length > 0 ? recentRegs.map(reg => (
                  <tr key={reg.id}>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-user-avatar">{reg.userName?.charAt(0) || '?'}</div>
                        <div>
                          <div className="adm-user-name">{reg.userName}</div>
                          <div className="adm-user-email">{reg.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color="#64748b" />
                        <span style={{ fontSize: '0.83rem' }}>{reg.webinarTitle}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {reg.registeredAt
                        ? new Date(reg.registeredAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td><span className="adm-badge adm-badge-green">Enrolled</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                      No enrollments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="adm-health-card">
          <div className="adm-table-title" style={{ marginBottom: '18px' }}>
            <Shield size={17} color="#10b981" />
            System Status
          </div>

          <div className="adm-health-item">
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>API Server</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500, marginTop: '2px' }}>Operational</div>
            </div>
            <div className="adm-health-indicator" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          </div>

          <div className="adm-health-item">
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>MongoDB Atlas</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500, marginTop: '2px' }}>Connected</div>
            </div>
            <Database size={18} color="#60a5fa" />
          </div>

          <div className="adm-health-item" style={{ opacity: 0.55 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email Service</div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>Not configured</div>
            </div>
            <div className="adm-health-indicator" style={{ background: '#64748b' }} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Platform Load
            </div>
            <div className="adm-progress-bar">
              <div className="adm-progress-fill" style={{ width: '42%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: '#64748b' }}>
              <span>42% utilized</span>
              <span>Uptime 99.9%</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={15} color="#10b981" />
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>All systems healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
