import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      }
    })

    if (!response.ok) throw new Error('Failed to fetch product page')

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) throw new Error('Failed to parse HTML')

    const domain = new URL(url).hostname

    // --- 1. DATA EXTRACTION VIA JSON-LD ---
    let ldData: any = {}
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]')
    scripts.forEach((script) => {
      try {
        const json = JSON.parse(script.textContent || '')
        const findProduct = (obj: any): any => {
          if (obj['@type'] === 'Product') return obj;
          if (obj['@graph'] && Array.isArray(obj['@graph'])) return obj['@graph'].find((i: any) => i['@type'] === 'Product');
          return null;
        }
        const product = Array.isArray(json) ? json.find(i => i['@type'] === 'Product') : findProduct(json);
        if (product) ldData = product;
      } catch (e) { /* skip */ }
    })

    // --- 2. CURRENCY & PRICE ---
    const currency = ldData.offers?.priceCurrency || 
                     ldData.offers?.[0]?.priceCurrency || 
                     doc.querySelector('meta[property="og:price:currency"]')?.getAttribute('content') ||
                     (url.includes('.in') ? 'INR' : 'USD');

    const rawPrice = ldData.offers?.price || 
                     ldData.offers?.[0]?.price || 
                     doc.querySelector('meta[property="og:price:amount"]')?.getAttribute('content') ||
                     doc.querySelector('.a-price-whole, ._30jeq3')?.textContent?.replace(/[^\d]/g, '');

    const formattedPrice = rawPrice ? 
      new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: currency,
        maximumFractionDigits: 0 
      }).format(Number(rawPrice)) : 'Price not available';

    // --- 3. IMAGE ---
    let imageUrl = ldData.image?.url || 
                   (Array.isArray(ldData.image) ? ldData.image[0] : ldData.image) ||
                   doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

    if (imageUrl && imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
    if (imageUrl && imageUrl.startsWith('/')) imageUrl = `https://${domain}${imageUrl}`;

    // --- 4. TITLE & BRAND ---
    const rawTitle = ldData.name || 
                     doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                     doc.querySelector('h1')?.textContent?.trim();
    
    const cleanTitle = rawTitle?.replace(/&amp;/g, '&') || `Product from ${domain}`;

    // --- 5. NEW: VARIANT & OPTION EXTRACTION ---
    // This section looks for Size and Color options commonly used in Shopify stores
    const variants: { sizes: string[], colors: string[] } = { sizes: [], colors: [] };

    // Method A: Check for buttons/labels common in Shopify themes
    const sizeSelectors = doc.querySelectorAll('.swatch-element.size, [data-value*="Size"], .size-selection, select[name*="size"] option');
    sizeSelectors.forEach((el: any) => {
      const val = el.getAttribute('data-value') || el.textContent.trim();
      if (val && !variants.sizes.includes(val) && val.toLowerCase() !== 'size chart') {
        variants.sizes.push(val);
      }
    });

    const colorSelectors = doc.querySelectorAll('.swatch-element.color, [data-value*="Color"], .color-selection, select[name*="color"] option');
    colorSelectors.forEach((el: any) => {
      const val = el.getAttribute('data-value') || el.textContent.trim();
      if (val && !variants.colors.includes(val)) {
        variants.colors.push(val);
      }
    });

    // --- 6. FINAL ASSEMBLY ---
    const productData = {
      url,
      title: cleanTitle,
      price: formattedPrice,
      image: imageUrl || '🎁',
      brand: ldData.brand?.name || ldData.brand || domain.split('.')[0],
      store: domain.includes('amazon') ? '🛒 Amazon' : domain.includes('flipkart') ? '🏪 Flipkart' : `🛍️ ${domain.split('.')[1] || domain}`,
      currency,
      availability: ldData.offers?.availability?.includes('InStock') ? 'In Stock' : 'Check Store',
      variants // Including the new variants object here
    }

    return new Response(
      JSON.stringify(productData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})