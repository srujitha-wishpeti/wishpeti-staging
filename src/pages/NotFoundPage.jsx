import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Visual Element */}
        <div style={styles.iconWrapper}>
          <Ghost size={64} color="#6366f1" strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <h1 style={styles.title}>404 - Page Not Found</h1>
        <p style={styles.text}>
          Oops! It looks like the wishlist or page you're looking for doesn't exist or has moved to a new home.
        </p>

        {/* Actions */}
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => navigate(-1)} 
            style={styles.secondaryButton}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            style={styles.primaryButton}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
          >
            <Home size={18} />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
  },
  content: {
    maxWidth: '450px',
    width: '100%',
  },
  iconWrapper: {
    marginBottom: '24px',
    display: 'inline-flex',
    padding: '24px',
    borderRadius: '30px',
    backgroundColor: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  text: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};