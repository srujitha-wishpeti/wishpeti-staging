export const detectUserCurrency = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    // Most IP APIs return the currency code directly (e.g., "USD", "INR")
    // If it doesn't, we can map country_code to currency
    const detectedCurrency = data.currency || 'INR'; 
    
    console.log(`📍 Detected Location: ${data.city}, ${data.country_name}`);
    return detectedCurrency;
  } catch (error) {
    console.error("Geolocation failed:", error);
    return 'INR'; // Fallback
  }
};