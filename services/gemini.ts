
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scrapeProductDetails(url: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract product details from this Indian e-commerce link: ${url}. 
    I need the exact product name, current price in INR (number only), a category (Tech, Lifestyle, Home, or Production), and a 20-word description for a fan wishlist.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.NUMBER },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          imageUrl: { type: Type.STRING, description: "A high-quality placeholder image URL related to this product" }
        },
        required: ["name", "price", "description", "category"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getGiftSuggestions(creatorPersona: string, category: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 unique gifting ideas for a creator with the following persona: "${creatorPersona}" in the category of "${category}". The items should be available in the Indian market. Provide name, approximate price in INR, and why it's a good gift.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["name", "price", "reason", "category"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function optimizeWishlistDescription(itemName: string, originalDesc: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Rewrite this creator wishlist item description to be more engaging and grateful for fans. Item: "${itemName}". Original Description: "${originalDesc}". Keep it under 50 words.`,
  });
  return response.text;
}
