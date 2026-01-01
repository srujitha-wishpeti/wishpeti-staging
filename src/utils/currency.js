// src/utils/currencyHelper.js

import { supabase } from "../services/supabaseClient";

// src/utils/currency.js


/*export const fetchExchangeRate = async (toCurrency) => {
  if (toCurrency === 'INR') return 1;

  // 1. Check Cache first (Save bandwidth and speed up UI)
  const cachedData = localStorage.getItem('wishpeti_rates');
  if (cachedData) {
    const { rates, expiry } = JSON.parse(cachedData);
    if (new Date().getTime() < expiry && rates[toCurrency]) {
      return rates[toCurrency];
    }
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/INR`);
    const data = await response.json();

    if (data.result === "success") {
      let rate = data.rates[toCurrency];

      // 2. 🛡️ PROTECT YOUR MARGINS (Safety Buffer)
      // If the API says 1 INR = 0.011 USD, we might want to adjust it 
      // slightly so the creator doesn't lose money on conversion.
      // Example: Reduce the rate by 1% to account for bank spreads.
      if (toCurrency === 'USD' || toCurrency === 'GBP' || toCurrency === 'EUR') {
        rate = rate * 0.99; 
      }

      // 3. Cache the result for 24 hours
      const cacheObject = {
        rates: data.rates,
        expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
      };
      localStorage.setItem('wishpeti_rates', JSON.stringify(cacheObject));

      return rate || 1;
    }
    return 1;
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return 1;
  }
};*/


const SAFETY_BUFFER = 0.015; 

export const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
  if (!amount || fromCurrency === toCurrency) return amount;

  // 1. Get the raw rate from your API data
  // Since your API base is INR, if fromCurrency is INR, rate is rates[toCurrency]
  let rate = rates[toCurrency];

  if (!rate) return amount;

  // 2. Apply the Safety Buffer
  // When converting INR -> USD (Buying USD), we effectively give the user 
  // a slightly "worse" rate to ensure the final INR received covers the gift.
  const bufferedRate = rate * (1 - SAFETY_BUFFER);

  // 3. Precision Rounding
  // For USD, we want 2 decimal places. For INR, we usually want whole numbers.
  const rawConverted = amount * bufferedRate;
  
  if (toCurrency === 'INR') {
    return Math.ceil(rawConverted); // Always round UP for INR to cover costs
  }
  
  // For USD/EUR/etc, round to 2 decimals
  return parseFloat(rawConverted.toFixed(2));
};



export const formatPrice = (amount, currencyCode = 'INR', rate = 1) => {
  // 1.  THE FIX: Clean the input
  // If amount is "₹1,500.50", this turns it into 1500.50
  let numericPrice = 0;
  
  if (typeof amount === 'string') {
    numericPrice = parseFloat(amount.replace(/[^\d.]/g, ''));
  } else {
    numericPrice = amount;
  }

  // 2. Safety check: if parsing failed, return TBD
  if (isNaN(numericPrice)) return 'Price TBD';

  // 3. Convert and Format
  const convertedAmount = numericPrice * rate;
  
  return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'INR' ? 0 : 2
  }).format(convertedAmount);
};

// utils/currency.js

export const saveCurrencyPreference = (code, rate) => {
  const pref = { code, rate, timestamp: Date.now() };
  localStorage.setItem('user_currency', JSON.stringify(pref));
  // Trigger a global event so other open components know to update
  window.dispatchEvent(new Event('currencyChanged'));
};

export const getCurrencyPreference = () => {
  const saved = localStorage.getItem('user_currency');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Optional: Expire rates older than 24 hours
    if (Date.now() - parsed.timestamp < 86400000) {
      return parsed;
    }
  }
  return { code: 'INR', rate: 1 }; // Default
};

export const getCurrencySymbol = (code) => {
  try {
    return (0).toLocaleString(
      'en-US', 
      { style: 'currency', currency: code, minimumFractionDigits: 0, maximumFractionDigits: 0 }
    ).replace(/\d/g, '').trim();
  } catch (e) {
    return '₹'; // Fallback
  }
};