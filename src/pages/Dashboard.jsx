import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationAPI, webinarAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Award, Compass, CalendarDays, CheckCircle, AlertTriangle, Activity, Download, BarChart2, Bell } from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';
import WebinarCard from '../components/WebinarCard';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [allWebinars, setAllWebinars] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [regRes, webRes] = await Promise.all([
        registrationAPI.getUserRegistrations(user?.id).catch(() => ({ data: [] })),
        webinarAPI.getAll().catch(() => ({ data: [] })),
      ]);
      
      const regs = regRes?.data || [];
      const webs = webRes?.data || [];
      
      setRegistrations(Array.isArray(regs) ? regs : []);
      setAllWebinars(Array.isArray(webs) ? webs : []);
      
      const rec = Array.isArray(webs) ? webs.filter(w => !regs.some(r => r.webinarId === w.id)).slice(0, 3) : [];
      setRecommended(rec);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load your dashboard. Please refresh or try again later.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (reg) => {
    const certId = crypto.randomUUID().split('-')[0].toUpperCase();
    const certWindow = window.open('', '_blank');
    const completionDate = reg.dateTime ? new Date(reg.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    const content = `
      <html>
        <head>
          <title>Certificate of Completion - ${reg.webinarTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@300;400;700&display=swap');
            body { font-family: 'Montserrat', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
            .cert-outer { padding: 10px; border: 1px solid #e2e8f0; background: white; }
            .cert-card { border: 15px double #1e40af; padding: 60px 80px; text-align: center; background: white; width: 900px; position: relative; box-sizing: border-box; }
            .branding { font-family: 'Cinzel', serif; font-size: 28px; color: #1e3a8a; margin-bottom: 20px; letter-spacing: 4px; }
            .cert-label { text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-size: 14px; margin-bottom: 10px; font-weight: 700; }
            .cert-name { font-size: 36px; font-weight: bold; color: #3b82f6; margin: 20px 0; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 40px 10px; }
            .cert-course { font-size: 24px; font-weight: 600; color: #1e293b; margin: 20px 0 40px; }
            .cert-bottom { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding: 0 40px; }
            .sig-line { border-top: 1px solid #94a3b8; width: 200px; margin: 10px auto; }
            .sig-text { font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            .seal { width: 100px; height: 100px; background: #bfdbfe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1e40af; border: 2px dashed #3b82f6; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="cert-outer">
            <div class="cert-card">
                For the successful completion of the professional development course
                <p class="webinar-name">${reg.webinarTitle}</p>
                <p class="instructor">Led by ${reg.instructorName || 'Academic Panel'}</p>
              </div>

              <div class="stamp-seal">OFFICIAL<br/>GRADUATE</div>

              <div class="footer-flex">
                <div class="date-box">
                  <span style="font-size: 12px; color: #64748b; font-weight: 700;">Issue Date:</span><br/>
                  <span style="font-weight: 700;">${completionDate}</span>
                </div>
                <div class="signature">
                  <div class="signature-text" style="font-family: cursive; font-size: 24px;">LearnHub Academy</div>
                  <div class="signature-box">
                    <strong>Director of Education</strong><br/>
                    <small>LearnHub Platform</small>
                  </div>
                </div>
              </div>

              <div class="cert-id">ID: LH-${certId}-${new Date().getFullYear()}</div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    certWindow.document.write(content);
    certWindow.document.close();
  };

  const stats = {
    total: registrations?.length || 0,
    upcoming: Array.isArray(registrations) ? registrations.filter(r => r?.webinarDateTime && new Date(r.webinarDateTime) > new Date()).length : 0,
    completed: Array.isArray(registrations) ? registrations.filter(r => r?.attended || (r?.webinarDateTime && new Date(r.webinarDateTime) < new Date())).length : 0,
    certificates: Array.isArray(registrations) ? registrations.filter(r => r?.attended).length : 0
  };

  const recentAttended = Array.isArray(registrations) ? registrations.filter(r => r.webinarStatus === 'COMPLETED' || r.attended).slice(0, 3) : [];
  const inProgress = Array.isArray(registrations) ? registrations.filter(r => r.webinarStatus === 'LIVE' || (r.webinarStatus === 'UPCOMING' && new Date(r.webinarDateTime) < new Date(Date.now() + 86400000))).slice(0, 3) : [];
  const upcomingReminders = Array.isArray(registrations)
    ? registrations
        .filter(r => {
          if (!r?.webinarDateTime) return false;
          const diff = new Date(r.webinarDateTime) - new Date();
          return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000);
        })
        .slice(0, 3)
    : [];

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  if (error) {
    return (
      <div className="page container" id="dashboard-error">
        <div className="error-container card glass animate-fade-in">
          <AlertTriangle size={48} className="mb-4 text-warning" />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page container" id="dashboard-no-auth">
        <div className="error-container card glass">
          <h2>Access Denied</h2>
          <p>Please log in to view your dashboard.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container" id="user-dashboard">
      <div className="page-header">
        <h1 className="gradient-text">Welcome back, {user?.name}!</h1>
        <p>Your personalized learning dashboard is ready.</p>
      </div>

      <div className="dash-stats-grid animate-fade-in">
        <div className="dash-stat-card card hover-up shadow-sm">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>
            <BarChart2 size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Registrations</span>
          </div>
        </div>
        <div className="dash-stat-card card hover-up shadow-sm">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <Bell size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        <div className="dash-stat-card card hover-up shadow-sm">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' }}>
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="dash-stat-card card hover-up shadow-sm">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(109, 40, 217, 0.12)', color: '#c084fc' }}>
            <Award size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.certificates}</span>
            <span className="stat-label">Certificates</span>
          </div>
        </div>
      </div>
      
      <ActivityHeatmap registrations={registrations} />

      <div className="learning-progress-section card glass mb-12">
        <div className="progress-info">
          <h3>Your Learning Journey</h3>
          <span>{Math.round((stats.certificates / (stats.total || 1)) * 100)}% Milestone Completed</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(stats.certificates / (stats.total || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="dashboard-grid-main">
        <div className="dashboard-main-col">
          <section className="dash-section" id="continue-learning">
            <div className="section-header-flex mb-6">
              <h3>Continue Learning</h3>
              <span className="item-count">{inProgress.length} Priority</span>
            </div>
            
            {inProgress.length > 0 ? (
              <div className="registrations-list grid grid-1">
                {inProgress.map((reg) => (
                  <div key={reg.id} className="registration-item-full card glass shadow-sm border-left-priority">
                    <div className="reg-info">
                      <div className="d-flex align-items-center gap-2">
                        <h4 className="reg-title m-0">{reg.webinarTitle}</h4>
                        {reg.webinarStatus === 'LIVE' && <span className="pulse-dot"></span>}
                      </div>
                      <p className="reg-meta">📅 {new Date(reg.webinarDateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                    <div className="reg-actions-flex d-flex gap-2">
                       <Link to={`/webinars/${reg.webinarId}`} className="btn btn-sm btn-primary">
                         {reg.webinarStatus === 'LIVE' ? 'Join Now ' : 'View Details'}
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-dashboard-state glass">
                <p>No active sessions today. Browse upcoming webinars to start learning!</p>
                <Link to="/webinars" className="btn btn-sm btn-outline">Browse All</Link>
              </div>
            )}
          </section>

          <section className="dash-section mt-12" id="recently-attended">
            <div className="section-header-flex mb-6">
              <h3>Recently Attended</h3>
              <Link to="/my-webinars" className="btn btn-sm btn-outline">View History</Link>
            </div>
            
            {recentAttended.length > 0 ? (
              <div className="grid grid-2">
                {recentAttended.map((reg) => (
                  <div key={reg.id} className="attended-card card glass">
                    <div className="attended-info">
                      <h4>{reg.webinarTitle}</h4>
                      <div className="d-flex gap-2 mt-2">
                        <Link to={`/webinars/${reg.webinarId}#resources`} className="btn btn-xs btn-accent">Resources</Link>
                        <button className="btn btn-xs btn-primary" onClick={() => handleDownloadCertificate(reg)}>Certificate</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No recently completed webinars yet.</p>
            )}
          </section>

          {recommended.length > 0 && (
            <section className="dash-section" id="recommended">
              <div className="section-header-flex mb-6">
                <h3>Recommended for You</h3>
                <Link to="/webinars" className="btn btn-sm btn-outline">Explore More</Link>
              </div>
              <div className="grid grid-3">
                {recommended.map((w) => (
                  <WebinarCard key={w.id} webinar={w} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="dashboard-side-col">
          <div className="dashboard-sidebar-section card">
            <h3>Learning Progress</h3>
            <div className="progress-mini-stats">
              <div className="p-stat">
                <span className="p-label">Growth Points</span>
                <span className="p-value">+{stats.certificates * 50}</span>
              </div>
              <div className="p-stat">
                <span className="p-label">Skill Level</span>
                <span className="p-value">{stats.certificates > 5 ? 'Senior' : 'Junior'}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar-section card mt-6">
            <h3>Upcoming Reminders</h3>
            {upcomingReminders.length > 0 ? (
              <div className="reminder-list">
                {upcomingReminders.map(rem => (
                  <div key={rem.id} className="reminder-item-card">
                    <div className="reminder-dot"></div>
                    <div className="reminder-info">
                      <p className="reminder-title">{rem.webinarTitle}</p>
                      <span className="reminder-time">In {Math.round((new Date(rem.webinarDateTime) - new Date()) / (24 * 60 * 60 * 1000))} days</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="empty-text">No reminders for the next 7 days.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
