// src/components/ui/SpotlightPortal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

export const SpotlightPortal = ({ children, onClose }) => {
  // Check if we are on the server (Next.js/SSR safety)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div style={spotlightOverlayStyle} onClick={onClose}>
      <style>
        {`
          @keyframes spotlightFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes cardPop {
            from { transform: scale(0.9) translateY(10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div 
        style={spotlightContentStyle} 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const spotlightOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.8)', 
  backdropFilter: 'blur(12px)',
  zIndex: 999999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  animation: 'spotlightFadeIn 0.3s ease-out',
  cursor: 'zoom-out' // Visual cue that clicking background closes it
};

const spotlightContentStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '420px', 
  animation: 'cardPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  cursor: 'default'
};

export default SpotlightPortal;