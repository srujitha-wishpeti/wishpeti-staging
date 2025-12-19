import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Heart } from 'lucide-react';
import '../../pages/CartPage.css'
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="cart-footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <h3 className="footer-logo">🎁 WishGifts</h3>
          <p className="footer-tagline">The easiest way to gift your favorite creators.</p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><Linkedin size={18} /></a>
          </div>
        </div>

        {/* Legal Links (Vital for Razorpay) */}
        <nav className="policy-links">
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund">Refund Policy</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>

        {/* Bottom Copyright */}
        <div className="footer-bottom">
          <p>© {currentYear} WishGifts - Secure Payments by Razorpay</p>
          <p className="made-with">
            Made with <Heart size={12} fill="#ef4444" color="#ef4444" /> in India
          </p>
        </div>
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