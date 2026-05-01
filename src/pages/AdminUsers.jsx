import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Download, Mail, Calendar,
  UserCheck, Shield, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { webinarAPI } from '../services/api';
import './Admin.css';

export default function AdminUsers() {
  const [webinars, setWebinars] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchWebinars = useCallback(async () => {
    setLoadingWebinars(true); setError(null);
    try {
      const r = await webinarAPI.getAdminWebinars();
      setWebinars(Array.isArray(r.data) ? r.data : []);
    } catch {
      setError('Failed to load webinars.');
    } finally { setLoadingWebinars(false); }
  }, []);

  useEffect(() => { fetchWebinars(); }, [fetchWebinars]);

  const fetchRegistrations = useCallback(async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const base = (import.meta.env.VITE_API_URL || 'https://fsadproject-backend.onrender.com').replace(/\/$/, '');
      const url = base.endsWith('/api') ? base : `${base}/api`;
      const r = await fetch(`${url}/registrations/webinar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) throw new Error();
      setRegistrations(await r.json());
    } catch {
      toast.error('Failed to load registrations');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId) fetchRegistrations(selectedId);
    else setRegistrations([]);
  }, [selectedId, fetchRegistrations]);

  const exportCSV = () => {
    const w = webinars.find(x => x.id?.toString() === selectedId);
    const header = 'Name,Email,Registered On\n';
    const rows = registrations.map(r =>
      `${r.userName || ''},${r.userEmail || ''},${r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `registrations_${(w?.title || 'export').replace(/ /g, '_')}.csv`;
    a.click();
    toast.success('Exported');
  };

  const filtered = registrations.filter(r =>
    (r.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.userEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph-title">Users</h1>
          <p className="adm-ph-sub">View and manage webinar registrations by session.</p>
        </div>
        {selectedId && registrations.length > 0 && (
          <button className="adm-btn-primary" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {error ? (
        <div className="adm-card" style={{ padding: '48px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
          <button className="adm-btn-primary" onClick={fetchWebinars}><RefreshCw size={15} /> Retry</button>
        </div>
      ) : (
        <>
          {/* Filter bar */}
          <div className="adm-filter-bar" style={{ gap: '12px', marginBottom: '16px',
            background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
            borderRadius: '16px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
              <label className="adm-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Webinar</label>
              <select
                className="adm-select" style={{ flex: 1 }}
                value={selectedId} onChange={e => setSelectedId(e.target.value)}
                disabled={loadingWebinars}
              >
                <option value="">— Select Webinar —</option>
                {webinars.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                    {w.dateTime ? ` · ${new Date(w.dateTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-search-wrap" style={{ flex: 1, minWidth: '180px' }}>
              <Search size={15} className="adm-search-icon" />
              <input
                className="adm-search-input" placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)}
                disabled={!selectedId}
              />
            </div>
          </div>

          <div className="adm-table-card">
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                Loading registrations...
              </div>
            ) : !selectedId ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <UserCheck size={52} color="#7c3aed" style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ color: '#94a3b8', marginBottom: '8px' }}>No Webinar Selected</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Select a webinar above to see its registrations.</p>
              </div>
            ) : filtered.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(reg => (
                      <tr key={reg.id}>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-user-avatar">{reg.userName?.charAt(0) || '?'}</div>
                            <div>
                              <div className="adm-user-name">{reg.userName || 'Unknown'}</div>
                              <div className="adm-user-email">ID: {reg.id?.toString().slice(-6) || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={13} color="#7c3aed" />
                            <span>{reg.userEmail || '—'}</span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={13} color="#10b981" />
                            {reg.registeredAt
                              ? new Date(reg.registeredAt).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', hour12: true
                                })
                              : '—'}
                          </div>
                        </td>
                        <td><span className="adm-badge adm-badge-green">Enrolled</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Users size={40} color="#475569" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#64748b' }}>No registrations found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
