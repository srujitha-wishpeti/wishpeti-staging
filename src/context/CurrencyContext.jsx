import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrencyPreference, saveCurrencyPreference, fetchExchangeRate } from '../utils/currency';
import { detectUserCurrency } from '../utils/geo';

// 1. Create the Context
export const CurrencyContext = createContext(null);

// 2. The Provider Component
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(getCurrencyPreference());
  const [loading, setLoading] = useState(true); // Added to help UI handling

  useEffect(() => {
    const initCurrency = async () => {
      const savedCurrency = localStorage.getItem('user_preference_currency');
      
      try {
        if (savedCurrency) {
          // If it's already the default from getCurrencyPreference(), skip fetch
          if (savedCurrency !== currency.code) {
            await updateCurrency(savedCurrency);
          }
        } else {
          const detected = await detectUserCurrency();
          if (detected !== currency.code) {
            await updateCurrency(detected);
          }
        }
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
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
      // Also save the code specifically for our init check
      localStorage.setItem('user_preference_currency', newCode);
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency, loading }}>
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