// src/utils/currencyHelper.js

export const fetchExchangeRate = async (toCurrency) => {
  if (toCurrency === 'INR') return 1;
  try {
    // Free API - no key required for basic usage
    const response = await fetch(`https://open.er-api.com/v6/latest/INR`);
    const data = await response.json();
    return data.rates[toCurrency] || 1;
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return 1;
  }
};

export const formatPrice = (amount, currencyCode = 'INR', rate = 1) => {
  // 1. 🚀 THE FIX: Clean the input
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