import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing it for 2 seconds so it doesn't jump scare them
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={bannerWrapper}>
      <div style={bannerCard}>
        <div style={iconStyle}>
          <ShieldCheck size={20} color="#6366f1" />
        </div>
        
        <div style={textContainer}>
          <p style={titleStyle}>We value your privacy</p>
          <p style={descStyle}>
            We use essential cookies and local storage to keep your cart saved and ensure secure payments. 
            By continuing, you agree to our use of these tools.
          </p>
        </div>

        <div style={actionStyle}>
          <button onClick={handleAccept} style={acceptBtn}>Got it!</button>
          <button onClick={() => setIsVisible(false)} style={closeBtn}><X size={18} /></button>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const bannerWrapper = {
  position: 'fixed',
  bottom: '20px',
  left: '20px',
  right: '20px',
  display: 'flex',
  justifyContent: 'center',
  zIndex: 99999,
  animation: 'slideUp 0.5s ease-out forwards'
};

const bannerCard = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '16px 20px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  maxWidth: '600px',
  width: '100%'
};

const iconStyle = {
  backgroundColor: '#f5f3ff',
  padding: '10px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const textContainer = { flex: 1 };
const titleStyle = { margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' };
const descStyle = { margin: '2px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' };

const actionStyle = { display: 'flex', alignItems: 'center', gap: '8px' };

const acceptBtn = {
  backgroundColor: '#6366f1',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  padding: '4px'
};