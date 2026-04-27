import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './WebinarCard.css';

export default function WebinarCard({ webinar }) {
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const statusClass = webinar.status?.toLowerCase() || 'upcoming';
  
  // Check if user has attended this webinar (from localStorage cache or backend)
  const attendedWebinars = JSON.parse(localStorage.getItem('attended_webinars') || '[]');
  const isCompletedByUser = attendedWebinars.includes(webinar.id) || webinar.attended;

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

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Smooth 3D tilt effect: max 8 degrees
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const cardStyle = {
    transform: isHovering 
      ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: isHovering ? 'transform 0.05s linear' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
  };

  return (
    <Link 
      to={`/webinars/${webinar.id}`} 
      className="webinar-card graduate-border" 
      id={`webinar-card-${webinar.id}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
    >
      <div className="webinar-card-header">
        {webinar.coverImageUrl ? (
          <img src={webinar.coverImageUrl} crossOrigin="anonymous" alt={webinar.title} className="webinar-cover" 
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.webinar-cover-placeholder') || e.target.insertAdjacentHTML('afterend', '<div class="webinar-cover-placeholder">⚡</div>'); }}
          />
        ) : (
          <div className="webinar-cover-placeholder">⚡</div>
        )}
        
        {webinar.category && (
          <span className="webinar-category-badge">{webinar.category}</span>
        )}
        
        <span className={`badge badge-${statusClass}`} style={{ position: 'absolute', top: '15px', right: '15px' }}>
          {webinar.status}
        </span>

        {isCompletedByUser && (
          <span className="badge badge-completed-success" style={{ position: 'absolute', top: '15px', left: '15px' }}>
            ✅ Completed
          </span>
        )}
      </div>

      <div className="webinar-card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
           <h3 className="webinar-title m-0">{webinar.title}</h3>
           {webinar.avgRating > 0 && (
             <div className="card-rating">
               ⭐ {webinar.avgRating.toFixed(1)}
             </div>
           )}
        </div>
        
        <div className="webinar-meta">
          <div className="webinar-meta-item">
            <span>📅</span>
            <span>{formatDateTime(webinar.dateTime)}</span>
          </div>
          <div className="webinar-meta-item">
            <span>⏱️</span>
            <span>{webinar.durationMinutes || '60'} mins</span>
          </div>
          <div className="webinar-meta-item">
            <span>👥</span>
            <span>{webinar.registrationCount || '0'} Registered</span>
          </div>
        </div>
      </div>

      <div className="webinar-card-footer">
        <div className="instructor-chip">
          <div className="instructor-avatar-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', fontSize: '10px', fontWeight: 'bold' }}>
            {webinar.instructor ? webinar.instructor.charAt(0).toUpperCase() : 'I'}
          </div>
          <span className="instructor-name">{webinar.instructor}</span>
        </div>
        <span className="view-btn">Details &rarr;</span>
      </div>
    </Link>
  );
}
