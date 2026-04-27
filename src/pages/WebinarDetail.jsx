import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { webinarAPI, registrationAPI, resourceAPI, ratingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, ClipboardList, Mic2, CalendarDays, BookOpen, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './WebinarDetail.css';

export default function WebinarDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [webinar, setWebinar] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState({ stars: 5, comment: '' });
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadWebinar = useCallback(async (isInitialLoad = true) => {
    if (isInitialLoad) setLoading(true);
    try {
      const [webRes, resRes, ratingRes] = await Promise.all([
        webinarAPI.getById(id),
        resourceAPI.getByWebinar(id).catch(() => ({ data: [] })),
        ratingAPI.getByWebinar(id).catch(() => ({ data: [] })),
      ]);
      setWebinar(webRes.data);
      setResources(resRes.data || []);
      setRatings(ratingRes.data || []);
      
      if (ratingRes.data?.length > 0) {
        const avg = ratingRes.data.reduce((acc, r) => acc + r.stars, 0) / ratingRes.data.length;
        setAvgRating(avg.toFixed(1));
      }

      // SILENT checking for registration - ONLY show toast on explicit action.
      if (user) {
        try {
          const checkRes = await registrationAPI.checkRegistration(id);
          setIsRegistered(!!checkRes.data?.registered);
          setRegistrationId(checkRes.data?.id || null);
        } catch (silentErr) {
          console.warn("Silent registration check skipped or failed.", silentErr);
        }
      }
    } catch (err) {
      console.error('Failed to load webinar details:', err);
      if (isInitialLoad) toast.error('Could not sync webinar metadata.');
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadWebinar(true);
  }, [loadWebinar]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    setSubmittingRating(true);
    try {
      const res = await ratingAPI.submit({
        userId: user.id,
        webinarId: id,
        stars: userRating.stars,
        comment: userRating.comment
      });
      setRatings([res.data, ...ratings]);
      setUserRating({ stars: 5, comment: '' });
      const newAvg = ([res.data, ...ratings]).reduce((acc, r) => acc + r.stars, 0) / (ratings.length + 1);
      setAvgRating(newAvg.toFixed(1));
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRegLoading(true);
    try {
      const resp = await registrationAPI.register(id);
      setIsRegistered(true);
      setRegistrationId(resp.data.id);
      toast.success('Access confirmed! Welcome to the session.');
      // Refresh webinar data for incremented counts
      loadWebinar(false);
    } catch (err) {
        const errMsg = err.response?.data?.message || "";
        if (errMsg.toLowerCase().includes("already registered")) {
            // Self-repair: update UI since backend confirms registration
            setIsRegistered(true);
            toast.success("You're already on the list! Resyncing...");
            loadWebinar(false);
        } else {
            toast.error(errMsg || 'Terminal registration failure.');
        }
    } finally {
      setRegLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationId) {
        toast.error('Local registration ID out of sync. Please wait...');
        loadWebinar(false);
        return;
    }
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    
    setRegLoading(true);
    try {
      await registrationAPI.cancel(registrationId);
      setIsRegistered(false);
      setRegistrationId(null);
      toast.success('Session registration terminated.');
      loadWebinar(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'TBD';
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  if (!webinar) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Webinar not found</h3>
          <Link to="/webinars" className="btn btn-outline">Back to Webinars</Link>
        </div>
      </div>
    );
  }

  const statusClass = webinar.status?.toLowerCase() || 'upcoming';

  return (
    <div className="page container" id="webinar-detail-page">
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-cover shadow-xl">
            {webinar.coverImageUrl ? (
              <img 
                src={webinar.coverImageUrl} 
                crossOrigin="anonymous" 
                alt={webinar.title} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextElementSibling?.classList.contains('detail-cover-placeholder')) {
                    e.target.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            {!webinar.coverImageUrl && <div className="detail-cover-placeholder">⚡</div>}
            <div className="detail-cover-placeholder" style={{ display: 'none' }}>⚡</div>
            <span className={`badge badge-${statusClass} detail-status-badge`}>{webinar.status}</span>
          </div>

          <div className="detail-content-area">
            <div className="detail-header-info">
              {webinar.category && <span className="detail-category-tag">{webinar.category}</span>}
              <h1 className="detail-title">{webinar.title}</h1>
              
              <div className="detail-instructor-strip">
                <div className="instructor-info">
                  <div className="instructor-avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '50%', width: '64px', height: '64px', fontSize: '24px', fontWeight: 'bold' }}>
                    {webinar.instructor ? webinar.instructor.charAt(0).toUpperCase() : 'I'}
                  </div>
                  <div>
                    <span className="inst-label">Presented By</span>
                    <span className="inst-name">{webinar.instructor}</span>
                  </div>
                </div>
                {avgRating > 0 && <div className="detail-avg-rating">⭐ {avgRating}<span>({ratings.length} Reviews)</span></div>}
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title">About this Session</h3>
              <p className="description-text">{webinar.description}</p>
            </div>

            <div className="detail-grid-sections">
              <div className="detail-section">
                <h3 className="section-title"><Target className="section-icon" /> What You Will Learn</h3>
                <ul className="learning-list">
                  <li>Master the core concepts of {webinar.category || 'this topic'}</li>
                  <li>Industry best practices and advanced techniques</li>
                  <li>Real-world case studies and practical applications</li>
                  <li>How to optimize your workflow for 2026 standards</li>
                  <li>Q&A session with {webinar.instructor}</li>
                </ul>
              </div>
              <div className="detail-section">
                <h3 className="section-title"><ClipboardList className="section-icon" /> Prerequisites</h3>
                <p className="description-text">Basic understanding of {webinar.category || 'the subject matter'}. No advanced setup required.</p>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title"><Mic2 className="section-icon" /> Speaker Bio</h3>
              <div className="speaker-bio-card card glass">
                <p><strong>{webinar.instructor}</strong> is a world-class expert in {webinar.category || 'technology'} with over 12 years of experience. Having led teams at top Fortune 500 companies, they bring a wealth of practical knowledge and a passion for teaching the next generation of professionals.</p>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title"><CalendarDays className="section-icon" /> Session Agenda</h3>
              <div className="agenda-timeline">
                <div className="agenda-item">
                  <span className="time">0:00</span>
                  <span className="event">Introduction & Housekeeping</span>
                </div>
                <div className="agenda-item">
                  <span className="time">0:15</span>
                  <span className="event">Main Topic: Deep Dive into {webinar.title}</span>
                </div>
                <div className="agenda-item">
                  <span className="time">0:45</span>
                  <span className="event">Interactive Workshop & Live Demo</span>
                </div>
                <div className="agenda-item">
                  <span className="time">1:15</span>
                  <span className="event">Q&A Session & Closing Remarks</span>
                </div>
              </div>
            </div>

            {webinar.status === 'COMPLETED' && isRegistered && (
              <div className="detail-section resources-section animate-fade-in">
                <h3 className="section-title"><BookOpen className="section-icon" /> Resources & Recordings</h3>
                <p className="description-text mb-3">As a registered participant, you have exclusive access to the session materials below.</p>
                <div className="resources-grid">
                  {resources.length > 0 ? resources.map((r) => (
                    <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="resource-link-card card">
                      <div className={`res-icon-box ${r.fileType.toLowerCase()}`}>
                        {getResourceIcon(r.fileType)}
                      </div>
                      <div className="res-info">
                        <span className="res-title">{r.title}</span>
                        <span className="res-action-label">
                          {r.fileType === 'PDF' ? 'Download PDF' : 
                           r.fileType === 'SLIDE' ? 'View Slides' :
                           r.fileType === 'LINK' ? 'Open Link' : 'Watch Recording'}
                        </span>
                      </div>
                    </a>
                  )) : (
                    <div className="no-resources">No additional resources have been uploaded for this session yet.</div>
                  )}
                </div>
              </div>
            )}

            {(webinar.status === 'UPCOMING' || webinar.status === 'LIVE') && isRegistered && (
               <div className="detail-section status-alert bg-primary-glow">
                 <p className="m-0">✨ <strong>Resources will be available after the session</strong>. Check back here once the webinar is completed!</p>
               </div>
            )}

            {webinar.streamUrl && (webinar.status === 'LIVE' || webinar.status === 'COMPLETED') && (
              <div className="detail-section stream-section glass">
                <h3>{webinar.status === 'LIVE' ? '📡 Watch Live Session' : '🎬 Watch Replay'}</h3>
                <p>Access the {webinar.status === 'LIVE' ? 'live stream' : 'recording'} for this webinar below.</p>
                <a href={webinar.streamUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg w-full">
                  {webinar.status === 'LIVE' ? 'Enter Live Stream' : 'Watch Recording'}
                </a>
              </div>
            )}

            <div className="detail-section ratings-section">
              <div className="section-title-flex">
                <h3>Reviews & Feedback</h3>
                {avgRating > 0 && <span className="count-badge">{ratings.length} Reviews</span>}
              </div>

              {(webinar.status === 'COMPLETED' || webinar.status === 'LIVE') && isRegistered && (
                <div className="rating-form-card card">
                  <h4>Leave a Review</h4>
                  <form onSubmit={handleRatingSubmit}>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" className={`star-btn ${userRating.stars >= s ? 'active' : ''}`} onClick={() => setUserRating({ ...userRating, stars: s })}>★</button>
                      ))}
                    </div>
                    <textarea placeholder="Tell others what you learned..." className="form-input" value={userRating.comment} onChange={(e) => setUserRating({ ...userRating, comment: e.target.value })} rows="3"></textarea>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingRating}>{submittingRating ? 'Posting...' : 'Post Review'}</button>
                  </form>
                </div>
              )}

              <div className="reviews-list">
                {ratings.map((r) => (
                  <div key={r.id} className="review-card card">
                    <div className="review-header">
                      <span className="review-user">{r.userName || 'Learning Enthusiast'}</span>
                      <span className="review-stars">{'★'.repeat(r.stars)}</span>
                    </div>
                    {r.comment && <p className="review-text">{r.comment}</p>}
                    <span className="review-date">{new Date(r.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                ))}
                {ratings.length === 0 && <p className="empty-reviews">No reviews yet. Join the session to be the first!</p>}
              </div>
            </div>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="sticky-sidebar-card glass shadow-lg">
            <h3>Event Information</h3>
            <div className="sidebar-meta-list">
              <div className="side-meta-item">
                <span className="side-icon">📅</span>
                <div className="side-info">
                  <span className="side-label">Scheduled For</span>
                  <span className="side-value">{formatDateTime(webinar.dateTime)}</span>
                </div>
              </div>
              <div className="side-meta-item">
                <span className="side-icon">⏱️</span>
                <div className="side-info">
                  <span className="side-label">Duration</span>
                  <span className="side-value">{webinar.durationMinutes || '60'} Minutes</span>
                </div>
              </div>
              <div className="side-meta-item">
                <span className="side-icon">👥</span>
                <div className="side-info">
                  <span className="side-label">Participants</span>
                  <span className="side-value">{webinar.registrationCount || '0'} Registered</span>
                </div>
              </div>
            </div>

            <div className="sidebar-actions">
              {regLoading ? (
                <button className="btn btn-primary btn-lg w-full" disabled>Processing...</button>
              ) : (
                <>
                  {webinar.status === 'UPCOMING' && !isAdmin() && !isRegistered && (
                    <button className="btn btn-primary btn-lg w-full" onClick={handleRegister} disabled={webinar.registrationCount >= (webinar.maxParticipants || 100)}>
                      Register Now →
                    </button>
                  )}
                  {webinar.status === 'LIVE' && !isAdmin() && (
                    isRegistered ? (
                      <a href={webinar.streamUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg w-full">
                        Join Live Now 🔴
                      </a>
                    ) : (
                      <button className="btn btn-primary btn-lg w-full" onClick={handleRegister}>
                        Register to Join Live Now 🔴
                      </button>
                    )
                  )}
                  {webinar.status === 'COMPLETED' && !isAdmin() && (
                    <a href={webinar.streamUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg w-full">
                      View Recording
                    </a>
                  )}
                  {webinar.status === 'CANCELLED' && !isAdmin() && (
                    <button className="btn btn-outline btn-lg w-full" disabled>Event Cancelled</button>
                  )}
                  {isRegistered && (
                    <div className="registration-status-group">
                      <div className="reg-status-pill">✅ You are Registered</div>
                      {webinar.status === 'UPCOMING' && (
                        <button 
                          className="btn btn-outline btn-sm w-full mt-3 text-danger border-danger hover:bg-danger/10"
                          onClick={handleCancelRegistration}
                        >
                          Cancel Registration
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
              {isAdmin() && <Link to={`/admin/webinars`} className="btn btn-outline w-full">Manage In Admin Portal</Link>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getResourceIcon(type) {
    switch(type) {
        case 'PDF': return '📄';
        case 'SLIDE': return '📊';
        case 'LINK': return '🔗';
        case 'VIDEO': return '🎥';
        default: return '📎';
    }
}
