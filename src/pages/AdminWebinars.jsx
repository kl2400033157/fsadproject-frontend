import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Users, AlertTriangle,
  RefreshCw, Video, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { webinarAPI } from '../services/api';
import './Admin.css';

const CATEGORIES = ['Development', 'Design', 'AI', 'Cloud', 'Security', 'Data', 'Web3'];

const emptyForm = {
  title: '', description: '', instructor: '', date: '', time: '',
  durationMinutes: 60, category: 'Development', maxParticipants: 100,
  status: 'UPCOMING', coverImageUrl: '', streamUrl: ''
};

const StatusBadge = ({ status }) => {
  const map = {
    LIVE:      { cls: 'adm-badge-red',    label: '● LIVE' },
    UPCOMING:  { cls: 'adm-badge-blue',   label: 'Upcoming' },
    COMPLETED: { cls: 'adm-badge-purple', label: 'Completed' },
    CANCELLED: { cls: 'adm-badge-orange', label: 'Cancelled' },
  };
  const { cls, label } = map[status] || { cls: 'adm-badge-purple', label: status };
  return <span className={`adm-badge ${cls}`}>{label}</span>;
};

export default function AdminWebinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await webinarAPI.getAdminWebinars();
      setWebinars(Array.isArray(r.data) ? r.data : []);
    } catch {
      setError('Failed to load webinars. Check backend connection.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setCurrent(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (w) => {
    setCurrent(w);
    const dt = w.dateTime ? new Date(w.dateTime) : new Date();
    setForm({
      title: w.title || '', description: w.description || '',
      instructor: w.instructor || '',
      date: dt.toISOString().split('T')[0],
      time: dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      durationMinutes: w.durationMinutes || 60, category: w.category || 'Development',
      maxParticipants: w.maxParticipants || 100, status: w.status || 'UPCOMING',
      coverImageUrl: w.coverImageUrl || '', streamUrl: w.streamUrl || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const dt = new Date(`${form.date}T${form.time}`);
      if (isNaN(dt)) { toast.error('Invalid date/time'); return; }
      const payload = { ...form, dateTime: dt.toISOString() };
      delete payload.date; delete payload.time;
      if (current) await webinarAPI.update(current.id, payload);
      else await webinarAPI.create(payload);
      toast.success(current ? 'Webinar updated' : 'Webinar created');
      setShowModal(false); fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await webinarAPI.delete(current.id);
      toast.success('Webinar deleted');
      setShowDel(false); setCurrent(null); fetch();
    } catch { toast.error('Delete failed'); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = webinars.filter(w =>
    (w.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.instructor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph-title">Webinars</h1>
          <p className="adm-ph-sub">Create, edit, and manage all webinar sessions.</p>
        </div>
        <button className="adm-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Create Webinar
        </button>
      </div>

      {error ? (
        <div className="adm-card" style={{ padding: '48px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
          <button className="adm-btn-primary" onClick={fetch}><RefreshCw size={15} /> Retry</button>
        </div>
      ) : (
        <div className="adm-table-card">
          {/* Filter bar */}
          <div className="adm-filter-bar">
            <div className="adm-search-wrap">
              <Search size={15} className="adm-search-icon" />
              <input
                className="adm-search-input" placeholder="Search by title or instructor..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="adm-icon-btn" onClick={fetch} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Webinar</th>
                  <th>Instructor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      {[1,2,3,4,5,6].map(j => (
                        <td key={j}><div className="adm-skeleton" style={{ height: '14px' }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length > 0 ? filtered.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '56px', height: '36px', borderRadius: '8px', overflow: 'hidden',
                          background: '#1e293b', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {w.coverImageUrl
                            ? <img src={w.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Video size={16} color="#475569" />
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem' }}>{w.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>{w.instructor || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {w.dateTime ? new Date(w.dateTime).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      }) : '—'}
                    </td>
                    <td><StatusBadge status={w.status} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={13} color="#7c3aed" />
                        <span style={{ fontWeight: 600 }}>{w.registeredCount || 0}</span>
                        <span style={{ color: '#64748b' }}>/ {w.maxParticipants}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="adm-icon-btn" onClick={() => openEdit(w)} title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button className="adm-icon-btn" onClick={() => { setCurrent(w); setShowDel(true); }}
                          title="Delete" style={{ color: '#f87171' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>
                      <Video size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
                      <div>No webinars found.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{current ? 'Edit Webinar' : 'Create Webinar'}</h2>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="adm-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Title *</label>
                  <input className="adm-input" required value={form.title} onChange={f('title')} placeholder="Webinar title" />
                </div>
                <div>
                  <label className="adm-label">Instructor *</label>
                  <input className="adm-input" required value={form.instructor} onChange={f('instructor')} placeholder="Instructor name" />
                </div>
                <div>
                  <label className="adm-label">Category</label>
                  <select className="adm-select" value={form.category} onChange={f('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="adm-label">Date *</label>
                  <input className="adm-input" type="date" required value={form.date} onChange={f('date')} />
                </div>
                <div>
                  <label className="adm-label">Time *</label>
                  <input className="adm-input" type="time" required value={form.time} onChange={f('time')} />
                </div>
                <div>
                  <label className="adm-label">Max Participants</label>
                  <input className="adm-input" type="number" value={form.maxParticipants}
                    onChange={e => setForm(p => ({ ...p, maxParticipants: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="adm-label">Duration (minutes)</label>
                  <input className="adm-input" type="number" value={form.durationMinutes}
                    onChange={e => setForm(p => ({ ...p, durationMinutes: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="adm-label">Status</label>
                  <select className="adm-select" value={form.status} onChange={f('status')}>
                    {['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="adm-label">Thumbnail URL</label>
                  <input className="adm-input" type="url" value={form.coverImageUrl} onChange={f('coverImageUrl')} placeholder="https://..." />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Stream / Meeting URL</label>
                  <input className="adm-input" type="url" value={form.streamUrl} onChange={f('streamUrl')} placeholder="https://meet.jit.si/..." />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Description *</label>
                  <textarea className="adm-textarea" rows={3} required value={form.description} onChange={f('description')} placeholder="Session description..." />
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (current ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDel && (
        <div className="adm-modal-overlay">
          <div className="adm-modal" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="adm-modal-body" style={{ padding: '36px 32px' }}>
              <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>Delete Webinar?</h3>
              <p style={{ color: '#64748b', marginBottom: '28px' }}>
                "<strong style={{ color: '#94a3b8' }}>{current?.title}</strong>" will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="adm-btn-ghost" onClick={() => setShowDel(false)}>Cancel</button>
                <button className="adm-btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
