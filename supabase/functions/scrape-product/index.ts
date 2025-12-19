import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Using the most stable DOM parser for Supabase Deno 2.x
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url) {
      throw new Error('Missing URL in request body');
    }

    // 1. Fetch the page with a real Browser User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!response.ok) {
      throw new Error(`Target site returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      throw new Error('Failed to parse HTML document');
    }

    const domain = new URL(url).hostname;

    // --- 2. Extract Data ---
    let ldData: any = {};
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      try {
        const content = script.textContent?.trim();
        if (!content) return;
        const json = JSON.parse(content);
        const findProduct = (obj: any): any => {
          if (obj['@type'] === 'Product') return obj;
          if (obj['@graph'] && Array.isArray(obj['@graph'])) return obj['@graph'].find((i: any) => i['@type'] === 'Product');
          return null;
        };
        const product = Array.isArray(json) ? json.find(i => i['@type'] === 'Product') : findProduct(json);
        if (product) ldData = product;
      } catch { /* ignore bad json segments */ }
    });

    // Price and Currency
    const currency = ldData.offers?.priceCurrency || ldData.offers?.[0]?.priceCurrency || 'INR';
    const rawPrice = ldData.offers?.price || ldData.offers?.[0]?.price || 
                     doc.querySelector('.a-price-whole, ._30jeq3')?.textContent?.replace(/[^\d]/g, '');

    // Image Logic (Amazon & Shopify specific)
    let imageUrl = ldData.image?.url || (Array.isArray(ldData.image) ? ldData.image[0] : ldData.image) ||
                   doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                   doc.querySelector('#landingImage')?.getAttribute('src') ||
                   doc.querySelector('#imgBlkFront')?.getAttribute('src');

    if (imageUrl && imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
    if (imageUrl) imageUrl = imageUrl.replace(/_\d+x\d+\./, '.').replace(/\._AC_.*_\./, '.');

    // Variants (Dynamic)
    const variants = { sizes: [] as string[], colors: [] as string[] };
    const sizeEls = doc.querySelectorAll('.swatch-element.size, [data-value*="Size"], select[name*="size"] option, #variation_size_name li');
    sizeEls.forEach((el: any) => {
      const val = el.getAttribute('data-value') || el.textContent.trim();
      if (val && !['Select', 'Size Chart'].some(s => val.includes(s)) && !variants.sizes.includes(val)) {
        variants.sizes.push(val);
      }
    });

    const colorEls = doc.querySelectorAll('.swatch-element.color, [data-value*="Color"], select[name*="color"] option, #variation_color_name li');
    colorEls.forEach((el: any) => {
      const val = el.getAttribute('data-value') || el.textContent.trim();
      if (val && !variants.colors.includes(val)) variants.colors.push(val);
    });

    // Final Assembly
    const finalData = {
      url,
      title: ldData.name || doc.querySelector('h1')?.textContent?.trim() || `Product from ${domain}`,
      price: rawPrice ? `${currency} ${rawPrice}` : 'Price TBD',
      image: imageUrl || '',
      store: domain,
      variants
    };

    return new Response(JSON.stringify(finalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 so the frontend gets the JSON error message instead of a CORS crash
    });
  }
});