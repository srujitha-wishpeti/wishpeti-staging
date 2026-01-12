import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const VerifiedBadge = () => (
  <CheckCircle2 
    size={16} 
    style={{ 
      color: '#3b82f6', 
      fill: '#eff6ff', 
      flexShrink: 0,
      display: 'inline-block'
    }} 
  />
);

export const FoundingBadge = ({ size = "md" }) => {
  const isSmall = size === "sm";
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: isSmall ? '1px 6px' : '2px 10px',
      background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      color: 'white',
      borderRadius: '4px',
      fontSize: isSmall ? '9px' : '10px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      height: isSmall ? '16px' : '20px',
      lineHeight: 1
    }}>
      <Sparkles size={isSmall ? 10 : 12} fill="white" /> 
      <span>Founding</span>
    </div>
  );
};