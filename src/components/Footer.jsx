import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-new shadow-lg">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-info">
            <h3 className="gradient-text footer-logo">LearnHub</h3>
            <p className="footer-tagline">
              Elevate your engineering skills with elite, industry-led workshops and interactive webinars.
            </p>
          </div>
          <div className="footer-links-group">
            <div className="footer-links-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/webinars">Webinars</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/dashboard">My Dashboard</Link></li>
                <li><a href="#" target="_blank" rel="noreferrer">Developer Docs</a></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4>Connect</h4>
              <div className="social-icons">
                <span className="social-icon">𝕏</span>
                <span className="social-icon">in</span>
                <span className="social-icon">gh</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
