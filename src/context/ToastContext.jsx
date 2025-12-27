import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';
import './ToastContext.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]); // Changed to an Array

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random(); // Add random to prevent identical IDs
  
    setToasts((prevToasts) => {
      // This ensures we always have the latest list, even if 5 calls happen at once
      return [...prevToasts, { id, message, type }];
    });
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Container for the Stack */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse', // Newest at bottom
        gap: '10px' 
      }}>
        {toasts.map((t) => (
          <Toast 
            key={t.id} 
            message={t.message} 
            type={t.type}
            onClose={() => hideToast(t.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);