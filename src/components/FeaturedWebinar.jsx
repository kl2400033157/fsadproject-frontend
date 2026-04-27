import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Flame } from 'lucide-react';
import './FeaturedWebinar.css';

export default function FeaturedWebinar({ webinar }) {
  if (!webinar) return null;

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

  return (
    <div className="featured-webinar-banner glass graduate-border animate-fade-in">
      <div className="featured-badge"><Flame size={16} /> Featured Webinar Today</div>
      <div className="featured-content">
        <div className="featured-info text-left">
          <span className="featured-category">{webinar.category || 'Tech Workshop'}</span>
          <h2 className="featured-title">{webinar.title}</h2>
          <p className="featured-description">
            Join {webinar.instructor} for an exclusive session on {webinar.title}. 
            Don't miss out on this opportunity to learn from the best!
          </p>
          <div className="featured-meta">
            <div className="meta-item">
              <CalendarDays size={18} className="text-primary" /> {formatDateTime(webinar.dateTime)}
            </div>
            <div className="meta-item">
              <Clock size={18} className="text-primary" /> {webinar.durationMinutes || '60'} Minutes
            </div>
          </div>
          <div className="featured-actions">
            <Link to={`/webinars/${webinar.id}`} className="btn btn-primary btn-lg shine">
              Register Now &rarr;
            </Link>
          </div>
        </div>
        <div className="featured-image-container">
          <img 
            src={webinar.coverImageUrl || `https://picsum.photos/seed/${webinar.id}/800/400`} 
            crossOrigin="anonymous"
            alt={webinar.title} 
            className="featured-image"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="fallback-placeholder" style={{ display: 'none', height: '100%', backgroundColor: 'var(--bg-secondary)', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>⚡</div>
        </div>
      </div>
    </div>
  );
}
