import { useState, useEffect } from 'react';
import { webinarAPI } from '../services/api';
import WebinarCard from '../components/WebinarCard';
import FeaturedWebinar from '../components/FeaturedWebinar';
import { Search } from 'lucide-react';
import './Webinars.css';

/**
 * Webinars listing page — Browse, search, filter webinars.
 * Demonstrates: useEffect, search with @RequestParam, conditional rendering.
 */
export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadWebinars();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [webinars, search, filter]);

  const loadWebinars = async () => {
    try {
      const res = await webinarAPI.getAll();
      setWebinars(res.data || []);
    } catch (err) {
      console.error('Failed to fetch webinars:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let result = [...webinars];
    if (filter !== 'ALL') {
      result = result.filter((w) => w.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.title?.toLowerCase().includes(q) ||
          w.instructor?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const statuses = ['ALL', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="page container" id="webinars-page">
      <div className="page-header animate-fade-in">
        <h1>Browse Webinars</h1>
        <p>Discover and register for upcoming sessions</p>
      </div>

      {/* Featured Banner — Nearest Upcoming */}
      {!loading && webinars.length > 0 && filter === 'ALL' && !search && (
        <FeaturedWebinar 
          webinar={webinars
            .filter(w => w.status === 'UPCOMING' || w.status === 'LIVE')
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0] || webinars[0]} 
        />
      )}

      {/* Search & Filter Bar */}
      <div className="webinars-toolbar glass animate-fade-in" id="webinars-toolbar">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="form-input search-input"
            id="webinar-search"
            placeholder="Search by title, instructor, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {statuses.map((s) => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              id={`filter-${s.toLowerCase()}`}
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Loading webinars...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-3 stagger" id="webinars-grid">
          {filtered.map((w) => (
            <WebinarCard key={w.id} webinar={w} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No webinars found</h3>
          <p>{search ? 'Try a different search term.' : 'No webinars match the selected filter.'}</p>
        </div>
      )}
    </div>
  );
}
