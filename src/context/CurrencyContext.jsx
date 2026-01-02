import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getCurrencyPreference, saveCurrencyPreference, formatPrice } from '../utils/currency';
import { detectUserCurrency } from '../utils/geo';

export const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(getCurrencyPreference());
  const [allRates, setAllRates] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Internal fetch logic (The "Edge Function" data)
  // We fetch the entire rates object once to power both switching and scraping
  const fetchAllRates = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('rates')
        .eq('id', 'current_rates')
        .maybeSingle();

      // Log the error if it exists
      if (error) {
        console.error("Supabase Query Error:", error);
        throw error;
      }

      // Safe check: If data is null, the row doesn't exist or is blocked by RLS
      if (!data) {
        console.warn("No row found in 'global_settings' with id 'current_rates'");
        return { "USD": 0.011, "INR": 1 }; 
      }

      return data.rates;
    } catch (err) {
      console.error("Failed to fetch rates:", err);
      return { "USD": 0.011, "INR": 1 }; 
    }
  };

  useEffect(() => {
    const init = async () => {
      const rates = await fetchAllRates();
      setAllRates(rates);

      const savedCode = localStorage.getItem('user_preference_currency');
      let code = savedCode;

      if (!code) {
        code = await detectUserCurrency();
      }

      // Set initial state from the fresh rates
      const finalCode = code || 'INR';
      setCurrency({ 
        code: finalCode, 
        rate: rates[finalCode] || rates['INR'] || 1 
      });
      
      setLoading(false);
    };
    init();
  }, []);

  // 2. The convertToInr logic (Moved from currency.js)
  // Uses the allRates already stored in context memory
  const convertToInr = (amount, symbol) => {
    const code = symbol === '$' ? 'USD' : 
                 symbol === '£' ? 'GBP' : 
                 symbol === '€' ? 'EUR' : 'INR';

    if (code === 'INR' || !allRates || !allRates[code]) return amount;

    // MATH: Foreign Amount / Rate = INR Base
    // Example: $14.00 / 0.011 = 1272.72 -> 1273 INR
    return Math.ceil(amount / allRates[code]);
  };

  const updateCurrency = (newCode) => {
    console.log(newCode);

    const rate = allRates[newCode] || 1;
    console.log(rate);
    setCurrency({ code: newCode, rate });
    saveCurrencyPreference(newCode, rate);
    localStorage.setItem('user_preference_currency', newCode);
  };

  const globalFormatPrice = (amount) => {
    return formatPrice(amount, currency.code, currency.rate);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      allRates, 
      updateCurrency, 
      loading, 
      formatPrice: globalFormatPrice,
      convertToInr // Exposed for AddWishlistItem.jsx
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};