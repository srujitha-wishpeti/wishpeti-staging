export const detectUserCurrency = async () => {
  const CACHE_KEY = 'geo_detection_attempted';
  const lastAttempt = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  // If we tried in the last 24 hours, don't even call the API
  // 86400000 ms = 24 hours
  if (lastAttempt && (now - parseInt(lastAttempt) < 86400000)) {
    console.log("🛡️ Shield: Skipping Geo-API to avoid rate limits.");
    return localStorage.getItem('user_preference_currency') || 'INR';
  }

  try {
    const response = await fetch('https://ipapi.co/json/');
    
    // Log the attempt time regardless of success or 429
    localStorage.setItem(CACHE_KEY, now.toString());

    if (response.status === 429) {
      return 'INR'; 
    }

    const data = await response.json();
    return data.currency || 'INR';
  } catch (error) {
    return 'INR';
  }
};