import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { webinarAPI } from '../services/api';
import WebinarCard from '../components/WebinarCard';
import ThreeBackground from '../components/ThreeBackground';
import FeaturedWebinar from '../components/FeaturedWebinar';
import { Shield, Sparkles, Search, PenSquare, PlayCircle } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    loadData();
    
    // Parallax scroll handler
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);

    // Advanced Intersection Observer for smooth reveal
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('section, .reveal').forEach(el => {
      el.classList.add('reveal-init');
      observer.observe(el);
    });

    return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

  const loadData = async () => {
    try {
      const [webRes, countRes] = await Promise.all([
        webinarAPI.getUpcoming().catch(() => ({ data: [] })),
        webinarAPI.getCount().catch(() => ({ data: { total: 0 } })),
      ]);
      setWebinars(webRes.data?.slice(0, 6) || []);
      setStats(countRes.data || { total: 0 });
    } catch (err) {
      console.error('Failed to load landing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const speakers = [
    { id: 1, name: 'Vivek Vardhan', title: 'Full Stack Architect', expertise: 'Spring Boot & React' },
    { id: 2, name: 'Dr. Arjun', title: 'System Designer', expertise: 'Microservices & DevOps' },
    { id: 3, name: 'Viswa', title: 'Cloud Specialist', expertise: 'AWS & Azure' },
    { id: 4, name: 'Siddharth', title: 'AI Researcher', expertise: 'Machine Learning & LLMs' },
  ];

  const testimonials = [
    { id: 1, name: 'Madhavi', text: 'The React architecture workshop was a complete game-changer for my career. The instructor was brilliant and the content was extremely practical!', rating: 5 },
    { id: 2, name: 'Sekar', text: 'I love how interactive the live sessions are. Being able to ask questions and get immediate feedback is so much better than pre-recorded videos.', rating: 5 },
    { id: 3, name: 'Sathwik', text: 'The post-webinar resources and recording access are worth every second. I finally understood AWS networking thanks to Viswa\'s session.', rating: 5 },
    { id: 4, name: 'Aditya', text: 'LearnHub is my go-to platform for staying updated with the latest tech trends. The community and the quality of speakers are unmatched.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section with 3D Background */}
      <section className="hero-section">
        <ThreeBackground />
        <div className="container hero-content">
          <div className="hero-text-area" style={{ transform: `translateY(${offsetY * 0.2}px)` }}>
            <span className="hero-badge animate-float"><Sparkles size={16} /> Expert-Led Learning</span>
            <h1 className="hero-title">
              Learn Real-World Skills from <span className="gradient-text">Industry Experts</span>
            </h1>
            <p className="hero-subtitle">
              Join live webinars, participate in hands-on workshops, and master the technology that matters today. No more learning in silos.
            </p>
            <div className="hero-actions d-flex gap-3">
              <Link to="/login" className="btn btn-primary btn-lg shine px-5">Student Login</Link>
              <Link to="/admin-login" className="btn btn-outline btn-lg px-5 d-flex align-items-center gap-2">
                <Shield size={18} /> Admin Login
              </Link>
            </div>
          </div>
          
          <div className="hero-stats-floating shadow-lg" style={{ transform: `translateY(${offsetY * -0.1}px)` }}>
            <div className="floating-stat">
              <span className="stat-num">{stats.total || '50'}+</span>
              <span className="stat-desc">Webinars</span>
            </div>
            <div className="floating-stat">
              <span className="stat-num">500+</span>
              <span className="stat-desc">Students</span>
            </div>
            <div className="floating-stat">
              <span className="stat-num">20+</span>
              <span className="stat-desc">Experts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Banner — Nearest Upcoming */}
      <div className="container" id="featured-home">
        {!loading && webinars.length > 0 && (
          <FeaturedWebinar 
            webinar={webinars
              .filter(w => w.status === 'UPCOMING' || w.status === 'LIVE')
              .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0] || webinars[0]} 
          />
        )}
      </div>

      {/* How It Works Section */}
      <section className="how-it-works-section bg-secondary">
        <div className="container">
          <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
          <div className="steps-grid">
            <div className="step-card card">
              <div className="step-icon"><Search size={32} className="text-primary" /></div>
              <h3>1. Browse</h3>
              <p>Explore our catalog of upcoming live webinars across various tech domains.</p>
            </div>
            <div className="step-card card">
              <div className="step-icon"><PenSquare size={32} className="text-primary" /></div>
              <h3>2. Register</h3>
              <p>Click once to join any session you're interested in. It's that simple.</p>
            </div>
            <div className="step-card card">
              <div className="step-icon"><PlayCircle size={32} className="text-primary" /></div>
              <h3>3. Learn</h3>
              <p>Join the live stream, interact with experts, and access post-event materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="speakers-section">
        <div className="container">
          <h2 className="section-title">Learn from <span className="gradient-text">Top Experts</span></h2>
          <div className="speakers-grid">
            {speakers.map(speaker => (
              <div key={speaker.id} className="speaker-card card">
                <div className="speaker-image fallback-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6', color: 'white', fontSize: '36px', fontWeight: 'bold' }}>
                  {speaker.name.charAt(0).toUpperCase()}
                </div>
                <h3>{speaker.name}</h3>
                <p className="speaker-title">{speaker.title}</p>
                <span className="speaker-expertise">{speaker.expertise}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Timeline Section */}
      <section className="timeline-section bg-secondary">
        <div className="container">
          <div className="section-header-flex">
            <h2 className="section-title text-left">Upcoming <span className="gradient-text">Schedule</span></h2>
            <Link to="/webinars" className="btn btn-sm btn-outline">View All &rarr;</Link>
          </div>
          
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <div className="timeline">
              {webinars.slice(0, 3).map((webinar, idx) => (
                <div key={webinar.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-date">{new Date(webinar.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  <div className="timeline-content card">
                    <h3>{webinar.title}</h3>
                    <p>{webinar.instructor} &bull; {webinar.category}</p>
                    <Link to={`/webinars/${webinar.id}`} className="btn btn-sm btn-primary">Join Live</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Students <span className="gradient-text">Say</span></h2>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.id} className="testimonial-card card">
                <div className="rating">{'★'.repeat(t.rating)}</div>
                <p>"{t.text}"</p>
                <div className="testimonial-user">
                  <div className="inline-avatar sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '40px', height: '40px', fontWeight: 'bold', marginRight: '1rem' }}>
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="container glass cta-inner">
          <h2>Ready to Ignite Your Learning Journey?</h2>
          <p>Join over 5,000+ engineers learning and growing with LearnHub every day.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
