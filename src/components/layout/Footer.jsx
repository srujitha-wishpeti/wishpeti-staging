import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        {/* Brand Section */}
        <div style={styles.section}>
          <h3 style={styles.logo}>🎁 WishPeti</h3>
          <p style={styles.tagline}>The easiest way for digital creators to receive gifts.</p>
          <div style={styles.socialLinks}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><Instagram size={20} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><Linkedin size={20} /></a>
          </div>
        </div>

        {/* Legal Links */}
        <div style={styles.section}>
          <h4 style={styles.heading}>Legal</h4>
          <nav style={styles.linkGroup}>
            <Link to="/terms" style={styles.link}>Terms & Conditions</Link>
            <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
            <Link to="/refund" style={styles.link}>Refund Policy</Link>
          </nav>
        </div>

        {/* Support Links */}
        <div style={styles.section}>
          <h4 style={styles.heading}>Support</h4>
          <nav style={styles.linkGroup}>
            <Link to="/shipping" style={styles.link}>Shipping Policy</Link>
            <Link to="/contact" style={styles.link}>Contact Us</Link>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.copyright}>
          <p>© {currentYear} WishPeti — Secure Payments by Razorpay</p>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
            Made with <Heart size={12} fill="#ef4444" color="#ef4444" /> for Creators
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
    padding: '60px 40px 30px',
    marginTop: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    paddingBottom: '40px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logo: { 
    fontSize: '22px', 
    fontWeight: '800', 
    margin: 0,
    color: '#0f172a' 
  },
  tagline: { 
    color: '#64748b', 
    fontSize: '14px', 
    lineHeight: '1.6',
    maxWidth: '250px'
  },
  socialLinks: { 
    display: 'flex', 
    gap: '15px', 
    marginTop: '10px' 
  },
  socialIcon: { 
    color: '#64748b', 
    textDecoration: 'none',
    transition: 'color 0.2s' 
  },
  linkGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  heading: { 
    fontSize: '14px', 
    fontWeight: '700', 
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8'
  },
  link: { 
    textDecoration: 'none', 
    color: '#475569', 
    fontSize: '14px', 
    transition: 'color 0.2s' 
  },
  bottomBar: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '30px',
    textAlign: 'center',
  },
  copyright: {
    color: '#94a3b8',
    fontSize: '13px',
  },
};