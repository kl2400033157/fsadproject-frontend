import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css'; // Reuse dashboard styles for consistency

/**
 * My Webinars page - specialized view for user's registrations.
 * Demonstrates robust API handling and clear empty/loading states.
 */
export default function MyWebinars() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
       loadRegistrations();
    } else if (user === null) {
       // Not logged in
       setLoading(false);
    }
  }, [user]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      // Always use /registrations/user/me for the logged-in user's view.
      // This endpoint extracts the ID from the JWT token for security.
      const response = await registrationAPI.getUserRegistrations();
      
      if (response && response.data) {
        setRegistrations(Array.isArray(response.data) ? response.data : []);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Failed to load user registrations:', err);
      setError('We encountered an error fetching your webinars. Please check your connection and try again.');
      toast.error('Could not load registrations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page" id="my-webinars-loading">
        <div className="spinner"></div>
        <p>Fetching your webinars...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page container" id="my-webinars-error">
        <div className="error-container card glass animate-fade-in text-center p-12 flex flex-col items-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="mt-4">Load Error</h2>
          <p className="mb-6">{error}</p>
          <button className="btn btn-primary" onClick={loadRegistrations}>Retry</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page container" id="my-webinars-auth-check">
        <div className="error-container card glass text-center p-12">
          <h2>Authentication Required</h2>
          <p className="mb-6">You need to be logged in to view your registered webinars.</p>
          <Link to="/login" className="btn btn-primary">Sign In Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container animate-fade-in" id="my-webinars-content">
      <div className="page-header mb-8">
        <h1 className="gradient-text">My Webinars</h1>
        <p>A complete list of workshops and sessions you've registered for.</p>
      </div>

      {registrations.length > 0 ? (
        <div className="registrations-list grid grid-1 gap-6">
          {registrations.map((reg) => (
            <div key={reg.id} className="registration-item-full card glass shadow-sm hover-up">
              <div className="reg-info">
                <h3 className="reg-title text-xl font-bold">{reg.webinarTitle || 'Untitled Webinar'}</h3>
                <div className="reg-meta-grid mt-2 flex gap-4">
                   <span className="reg-meta flex items-center gap-2"><Calendar size={14} /> {reg.dateTime ? new Date(reg.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Date TBD'}</span>
                </div>
              </div>
              <div className="reg-actions-flex flex items-center gap-4">
                 {reg.attended && <span className="badge badge-success px-3 py-1 rounded-full text-xs font-semibold">ATTENDED</span>}
                 <Link to={`/webinars/${reg.webinarId}`} className="btn btn-sm btn-outline">
                    View Details
                 </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-dashboard-state glass text-center p-16 animate-fade-in flex flex-col items-center">
          <Ticket size={64} className="text-muted mb-6 opacity-50" />
          <h3>No Registrations Found</h3>
          <p className="mb-8">It looks like you haven't registered for any webinars yet. Ready to start learning?</p>
          <Link to="/webinars" className="btn btn-primary">Discover Webinars</Link>
        </div>
      )}
    </div>
  );
}
