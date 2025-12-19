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
          <h3 style={styles.logo}>🎁 WishGifts</h3>
          <p style={styles.tagline}>The easiest way to gift your favorite creators.</p>
          <div style={styles.socialLinks}>
            <a href="https://instagram.com/yourhandle" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <Instagram size={20} />
            </a>
            <a href="https://linkedin.com/company/yourcompany" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div style={styles.linkGroup}>
          <h4 style={styles.heading}>Platform</h4>
          <Link to="/how-it-works" style={styles.link}>How it Works</Link>
          <Link to="/search" style={styles.link}>Find a Wishlist</Link>
        </div>

        <div style={styles.linkGroup}>
          <h4 style={styles.heading}>Legal</h4>
          <Link to="/terms" style={styles.link}>Terms & Conditions</Link>
          <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <p style={styles.copyright}>
          © {currentYear} WishGifts. Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> in India.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #eee',
    padding: '60px 20px 20px',
    marginTop: 'auto', // Pushes footer to bottom if page is short
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
  logo: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  tagline: { color: '#64748b', fontSize: '14px', lineHeight: '1.5' },
  socialLinks: { display: 'flex', gap: '15px', marginTop: '10px' },
  socialIcon: { color: '#1e293b', transition: 'color 0.2s' },
  linkGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  heading: { fontSize: '16px', fontWeight: '700', marginBottom: '8px' },
  link: { textDecoration: 'none', color: '#64748b', fontSize: '14px', transition: 'color 0.2s' },
  bottomBar: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px',
    textAlign: 'center',
  },
  copyright: {
    color: '#94a3b8',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  },
};