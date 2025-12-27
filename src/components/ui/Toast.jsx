import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // Slightly longer for reading
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = type === 'error';

  return (
    <div className={`toast-notification ${isError ? 'error-toast' : ''}`} 
         style={{
           display: 'flex', 
           alignItems: 'center', 
           gap: '12px',
           padding: '12px 20px',
           background: isError ? '#fef2f2' : '#ffffff', // Light red for errors
           border: `1px solid ${isError ? '#fecaca' : '#e2e8f0'}`,
           borderRadius: '12px',
           boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
           animation: 'slideIn 0.3s ease-out'
         }}>
      {isError ? (
        <AlertCircle size={20} color="#ef4444" />
      ) : (
        <CheckCircle size={20} color="#10b981" />
      )}
      
      <span style={{ color: isError ? '#991b1b' : '#1e293b', fontWeight: '500' }}>
        {message}
      </span>
      
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
        <X size={16} />
      </button>
    </div>
  );
}