// Fetch the latest INR to USD rate
export const getExchangeRate = async () => {
  try {
    // This is a free endpoint (no API key required for basic usage)
    const response = await fetch('https://open.er-api.com/v6/latest/INR');
    const data = await response.json();
    return data.rates.USD; 
  } catch (error) {
    console.error("Currency fetch failed:", error);
    return 0.012; // Fallback rate (approx 1/84)
  }
};