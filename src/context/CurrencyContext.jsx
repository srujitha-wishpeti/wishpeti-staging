import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrencyPreference, saveCurrencyPreference, fetchExchangeRate } from '../utils/currency';
import { detectUserCurrency } from '../utils/geo';

// 1. Create the Context
export const CurrencyContext = createContext(null);

// 2. The Provider Component
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(getCurrencyPreference());

  useEffect(() => {
    const initCurrency = async () => {
      // 1. Check if user has already MANUALLY picked a currency before
      const savedCurrency = localStorage.getItem('user_preference_currency');
      
      if (savedCurrency) {
        // Just use the saved one
        updateCurrency(savedCurrency);
      } else {
        // 2. No saved preference? Run Geolocation
        const detected = await detectUserCurrency();
        updateCurrency(detected);
        // Note: We don't save to localStorage yet so they aren't "locked" 
        // until they actually use the site/manually change it.
      }
    };

    initCurrency();
  }, []);

  const updateCurrency = async (newCode) => {
    try {
      const rate = await fetchExchangeRate(newCode);
      const newPref = { code: newCode, rate };
      setCurrency(newPref);
      saveCurrencyPreference(newCode, rate);
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// 3. The Custom Hook
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};