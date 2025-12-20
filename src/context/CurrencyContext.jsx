import React, { createContext, useContext, useState } from 'react';
import { getCurrencyPreference, saveCurrencyPreference, fetchExchangeRate } from '../utils/currency';

// 1. Create the Context
export const CurrencyContext = createContext(null);

// 2. The Provider Component
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(getCurrencyPreference());

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