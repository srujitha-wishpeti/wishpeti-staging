import axios from 'axios';

export const scrapeProduct = async (targetUrl) => {
  const apiKey = 'YOUR_ZENROWS_API_KEY';
  const apiUrl = 'https://api.zenrows.com/v1/';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        'apikey': apiKey,
        'url': targetUrl,
        // 'js_render': 'true' is critical for Myntra/Flipkart to load prices
        'js_render': 'true', 
        'premium_proxy': 'true',
        'proxy_country': 'in' // Forces an Indian IP for better local pricing
      }
    });

    return response.data; // This is the raw HTML of the product page
  } catch (error) {
    console.error("Scraping failed:", error.message);
    return null;
  }
};