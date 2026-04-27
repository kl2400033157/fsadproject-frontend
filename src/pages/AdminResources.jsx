import { useState, useEffect, useCallback } from 'react';
import {
  FileUp, Trash2, Plus, ExternalLink, FileText,
  Layout, Video, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import './Admin.css';

const TYPE_ICONS = {
  PDF:   { icon: FileText,     color: '#fb7185', bg: 'rgba(244,63,94,0.1)' },
  SLIDE: { icon: Layout,       color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  VIDEO: { icon: Video,        color: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
  LINK:  { icon: ExternalLink, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
};

const emptyForm = { title: '', fileType: 'PDF', fileUrl: '', description: '' };

export default function AdminResources() {
  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const [loadingRes, setLoadingRes] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchWebinars = useCallback(async () => {
    setLoadingWebinars(true); setError(null);
    try {
      const r = await API.get('/admin/webinars');
      const all = Array.isArray(r.data) ? r.data : [];
      setWebinars(all.filter(w => w.status === 'COMPLETED'));
    } catch {
      setError('Failed to load completed webinars.');
    } finally { setLoadingWebinars(false); }
  }, []);

  useEffect(() => { fetchWebinars(); }, [fetchWebinars]);

  const fetchResources = useCallback(async (id) => {
    setLoadingRes(true);
    try {
      const r = await API.get(`/resources/webinar/${id}`);
      setResources(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Failed to load resources');
    } finally { setLoadingRes(false); }
  }, []);

  useEffect(() => {
    if (selectedId) fetchResources(selectedId);
    else setResources([]);
  }, [selectedId, fetchResources]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    try {
      await API.post('/admin/resources', { ...form, webinarId: selectedId });
      toast.success('Resource added');
      setForm(emptyForm);
      fetchResources(selectedId);
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/resources/${id}`);
      toast.success('Resource deleted');
      fetchResources(selectedId);
    } catch { toast.error('Delete failed'); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      {/* Header */}
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph-title">Resources</h1>
          <p className="adm-ph-sub">Upload and manage materials for completed webinars.</p>
        </div>
        <button className="adm-icon-btn" onClick={fetchWebinars} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {error ? (
        <div className="adm-card" style={{ padding: '48px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
          <button className="adm-btn-primary" onClick={fetchWebinars}><RefreshCw size={15} /> Retry</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Webinar selector */}
            <div className="adm-card" style={{ padding: '20px' }}>
              <div className="adm-label" style={{ marginBottom: '10px' }}>Select Completed Webinar</div>
              {loadingWebinars ? (
                <div className="adm-skeleton" style={{ height: '40px', borderRadius: '10px' }} />
              ) : webinars.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No completed webinars found.</p>
              ) : (
                <select className="adm-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                  <option value="">— Pick a webinar —</option>
                  {webinars.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Upload form */}
            {selectedId && (
              <div className="adm-card" style={{ padding: '20px' }}>
                <div className="adm-table-title" style={{ marginBottom: '18px' }}>
                  <FileUp size={17} color="#10b981" /> Upload Resource
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="adm-form-group">
                    <label className="adm-label">Title *</label>
                    <input className="adm-input" required placeholder="e.g. Session Slides" value={form.title} onChange={f('title')} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label className="adm-label">Type</label>
                      <select className="adm-select" value={form.fileType} onChange={f('fileType')}>
                        <option value="PDF">PDF</option>
                        <option value="SLIDE">Slides</option>
                        <option value="VIDEO">Video</option>
                        <option value="LINK">Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="adm-label">URL *</label>
                      <input className="adm-input" type="url" required placeholder="https://..." value={form.fileUrl} onChange={f('fileUrl')} />
                    </div>
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Description</label>
                    <textarea className="adm-textarea" rows={2} placeholder="Optional..." value={form.description} onChange={f('description')} />
                  </div>
                  <button type="submit" className="adm-btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                    <Plus size={15} /> {saving ? 'Uploading...' : 'Add Resource'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Panel — Resources List */}
          <div className="adm-card" style={{ minHeight: '400px' }}>
            <div className="adm-table-title" style={{ padding: '18px 22px', borderBottom: '1px solid var(--adm-border)' }}>
              <Layers size={17} color="#64748b" /> Resources
              {resources.length > 0 && (
                <span className="adm-badge adm-badge-purple" style={{ marginLeft: '8px' }}>{resources.length}</span>
              )}
            </div>

            {!selectedId ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <Layout size={48} color="#334155" style={{ marginBottom: '16px' }} />
                <h4 style={{ color: '#64748b', marginBottom: '8px' }}>No Webinar Selected</h4>
                <p style={{ color: '#475569', fontSize: '0.875rem' }}>Pick a completed webinar to manage its resources.</p>
              </div>
            ) : loadingRes ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Loading resources...</div>
            ) : resources.length > 0 ? (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resources.map(res => {
                  const t = TYPE_ICONS[res.fileType] || TYPE_ICONS.PDF;
                  const Icon = t.icon;
                  return (
                    <div key={res.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', background: 'var(--adm-bg)',
                      border: '1px solid var(--adm-border)', borderRadius: '12px',
                      transition: 'border-color 0.15s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                          background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Icon size={20} color={t.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{res.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {res.fileType} {res.description ? `· ${res.description}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href={res.fileUrl} target="_blank" rel="noreferrer" className="adm-icon-btn" title="Open">
                          <ExternalLink size={15} />
                        </a>
                        <button className="adm-icon-btn" style={{ color: '#f87171' }} onClick={() => handleDelete(res.id)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <AlertCircle size={36} color="#475569" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#64748b' }}>No resources yet. Upload one using the form.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
