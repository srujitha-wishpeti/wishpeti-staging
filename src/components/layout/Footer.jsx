import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      {/* Inline CSS for Hover Effects */}
      <style>
        {`
          .footer-link:hover { color: #4f46e5 !important; transform: translateX(3px); }
          .social-icon:hover { color: #4f46e5 !important; transform: scale(1.1); }
          .footer-link, .social-icon { transition: all 0.2s ease-in-out; display: inline-block; }
        `}
      </style>

      <div style={styles.container}>
        {/* Brand Section */}
        <div style={styles.section}>
          <h3 style={styles.logo}>🎁 WishPeti</h3>
          <p style={styles.tagline}>The safest way for digital creators to receive gifts from fans worldwide.</p>
          <div style={styles.socialLinks}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" style={styles.socialIcon}>
              <Instagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" style={styles.socialIcon}>
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Legal Group */}
        <div style={styles.section}>
          <h4 style={styles.heading}>Legal</h4>
          <nav style={styles.linkGroup}>
            <Link to="/terms" className="footer-link" style={styles.link}>Terms & Conditions</Link>
            <Link to="/privacy" className="footer-link" style={styles.link}>Privacy Policy</Link>
            <Link to="/refund" className="footer-link" style={styles.link}>Refund Policy</Link>
          </nav>
        </div>

        {/* Support Group */}
        <div style={styles.section}>
          <h4 style={styles.heading}>Compliance</h4>
          <nav style={styles.linkGroup}>
            <Link to="/shipping" className="footer-link" style={styles.link}>Shipping Policy</Link>
            <Link to="/contact" className="footer-link" style={styles.link}>Contact Us</Link>
          </nav>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <div style={styles.copyright}>
          <p>© {currentYear} WishPeti — Secure Payments by Razorpay</p>
          <p style={styles.madeWith}>
            Made with <Heart size={12} fill="#ef4444" color="#ef4444" /> for the Creator Economy
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #f1f5f9',
    padding: '80px 40px 40px',
    marginTop: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    // This creates 3 columns on desktop and 1 on mobile automatically
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '60px',
    paddingBottom: '60px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: { 
    fontSize: '24px', 
    fontWeight: '800', 
    margin: 0, 
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  tagline: { 
    color: '#64748b', 
    fontSize: '15px', 
    lineHeight: '1.6', 
    maxWidth: '280px' 
  },
  socialLinks: { 
    display: 'flex', 
    gap: '20px', 
    marginTop: '8px' 
  },
  socialIcon: { 
    color: '#94a3b8', 
    textDecoration: 'none' 
  },
  linkGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  heading: { 
    fontSize: '13px', 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: '0.1em', 
    color: '#94a3b8',
    marginBottom: '8px'
  },
  link: { 
    textDecoration: 'none', 
    color: '#475569', 
    fontSize: '14px',
    fontWeight: '500'
  },
  bottomBar: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '40px',
    textAlign: 'center',
  },
  copyright: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: '1.8'
  },
  madeWith: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '8px'
  }
};