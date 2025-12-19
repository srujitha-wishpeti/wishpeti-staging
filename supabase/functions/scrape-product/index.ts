// supabase/functions/scrape-product/index.ts
// Complete working version

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
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

    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch product page')
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }
    
    const domain = new URL(url).hostname

    // Initialize product data
    const productData: any = {
      url: url,
      title: '',
      price: '',
      originalPrice: '',
      discount: '',
      image: '🎁',
      brand: '',
      store: '',
      category: '',
      variants: {
        sizes: [],
        colors: [],
        materials: [],
        styles: [],
        selectedSize: '',
        selectedColor: '',
        selectedMaterial: '',
        selectedStyle: ''
      },
      customOptions: [],
      specifications: [],
      availability: 'In Stock',
      rating: null,
      reviews: null
    }

    // Amazon scraping
    if (domain.includes('amazon')) {
      productData.title = doc.querySelector('#productTitle')?.textContent?.trim() || 
                         doc.querySelector('span#productTitle')?.textContent?.trim() || ''
      
      productData.price = doc.querySelector('.a-price-whole')?.textContent?.trim() ||
                         doc.querySelector('span.a-price-whole')?.textContent?.trim() || ''
      
      productData.originalPrice = doc.querySelector('.a-text-price .a-offscreen')?.textContent?.trim() || ''
      
      const imageElement = doc.querySelector('#landingImage') || doc.querySelector('#imgTagWrapperId img')
      productData.image = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-old-hires') || '📦'
      
      productData.brand = doc.querySelector('#bylineInfo')?.textContent?.trim()?.replace('Visit the ', '')?.replace(' Store', '') || ''
      
      productData.store = '🛒 Amazon'
      productData.category = 'electronics'

      // Get rating
      const ratingText = doc.querySelector('.a-icon-star span')?.textContent?.trim()
      if (ratingText) {
        const ratingMatch = ratingText.match(/[\d.]+/)
        if (ratingMatch) {
          productData.rating = parseFloat(ratingMatch[0])
        }
      }

      // Get reviews count
      const reviewsText = doc.querySelector('#acrCustomerReviewText')?.textContent?.trim()
      if (reviewsText) {
        const reviewsMatch = reviewsText.replace(/,/g, '').match(/\d+/)
        if (reviewsMatch) {
          productData.reviews = parseInt(reviewsMatch[0])
        }
      }

      // Get color variants
      const colorElements = doc.querySelectorAll('#variation_color_name li')
      if (colorElements) {
        productData.variants.colors = Array.from(colorElements)
          .map((el: any) => el.getAttribute('title'))
          .filter(Boolean)
      }

      // Get size variants
      const sizeElements = doc.querySelectorAll('#variation_size_name li')
      if (sizeElements) {
        productData.variants.sizes = Array.from(sizeElements)
          .map((el: any) => el.textContent?.trim())
          .filter(Boolean)
      }

      // Calculate discount
      if (productData.price && productData.originalPrice) {
        const price = parseFloat(productData.price.replace(/[^0-9.]/g, ''))
        const original = parseFloat(productData.originalPrice.replace(/[^0-9.]/g, ''))
        if (!isNaN(price) && !isNaN(original) && original > price) {
          const discountPercent = Math.round(((original - price) / original) * 100)
          productData.discount = `${discountPercent}% off`
        }
      }

      // Add price symbol if missing
      if (productData.price && !productData.price.includes('₹') && !productData.price.includes('$')) {
        productData.price = '₹' + productData.price
      }
    }
    // Flipkart scraping
    else if (domain.includes('flipkart')) {
      productData.title = doc.querySelector('span.B_NuCI')?.textContent?.trim() ||
                         doc.querySelector('._35KyD6')?.textContent?.trim() || ''
      
      productData.price = doc.querySelector('._30jeq3')?.textContent?.trim() ||
                         doc.querySelector('._1_WHN1')?.textContent?.trim() || ''
      
      const imageElement = doc.querySelector('._396cs4 img') || doc.querySelector('img._2r_T1I')
      productData.image = imageElement?.getAttribute('src') || '📦'
      
      productData.store = '🏪 Flipkart'
      productData.category = 'electronics'

      // Get discount
      const discountText = doc.querySelector('._3Ay6Sb')?.textContent?.trim()
      if (discountText) {
        productData.discount = discountText
      }
    }
    // Myntra scraping
    else if (domain.includes('myntra')) {
      productData.title = doc.querySelector('.pdp-title')?.textContent?.trim() ||
                         doc.querySelector('h1.pdp-name')?.textContent?.trim() || ''
      
      productData.price = doc.querySelector('.pdp-price strong')?.textContent?.trim() ||
                         doc.querySelector('span.pdp-price')?.textContent?.trim() || ''
      
      const imageElement = doc.querySelector('.image-grid-image')
      productData.image = imageElement?.getAttribute('src') || '👕'
      
      productData.brand = doc.querySelector('.pdp-brand')?.textContent?.trim() || ''
      
      productData.store = '👕 Myntra'
      productData.category = 'fashion'

      // Get sizes
      const sizeElements = doc.querySelectorAll('.size-buttons-size-button')
      if (sizeElements) {
        productData.variants.sizes = Array.from(sizeElements)
          .map((el: any) => el.textContent?.trim())
          .filter(Boolean)
      }
    }
    // Ajio scraping
    else if (domain.includes('ajio')) {
      productData.title = doc.querySelector('.prod-title')?.textContent?.trim() ||
                         doc.querySelector('h1')?.textContent?.trim() || ''
      
      productData.price = doc.querySelector('.prod-sp')?.textContent?.trim() || ''
      
      const imageElement = doc.querySelector('.prod-image-main img')
      productData.image = imageElement?.getAttribute('src') || '👗'
      
      productData.brand = doc.querySelector('.prod-brand')?.textContent?.trim() || ''
      
      productData.store = '👗 Ajio'
      productData.category = 'fashion'
    }
    // Generic fallback using OpenGraph tags
    else {
      productData.title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                         doc.querySelector('title')?.textContent?.trim() || 
                         'Product from ' + domain
      
      productData.price = doc.querySelector('meta[property="og:price:amount"]')?.getAttribute('content') || 
                         'Price not available'
      
      const imageElement = doc.querySelector('meta[property="og:image"]') || doc.querySelector('img')
      productData.image = imageElement?.getAttribute('content') || imageElement?.getAttribute('src') || '🎁'
      
      productData.store = '🛍️ ' + domain
      productData.category = 'general'
    }

    // Clean up data
    if (!productData.title) {
      productData.title = `Product from ${domain}`
    }

    if (!productData.price || productData.price === 'Price not available') {
      productData.price = 'Price not available'
    } else if (!productData.price.includes('₹') && !productData.price.includes('$')) {
      productData.price = '₹' + productData.price
    }

    // Handle image - use emoji if no valid image URL
    if (!productData.image || productData.image === '') {
      // Set emoji based on category or store
      if (domain.includes('amazon') || domain.includes('flipkart')) {
        productData.image = '📦'
      } else if (domain.includes('myntra') || domain.includes('ajio')) {
        productData.image = '👕'
      } else if (domain.includes('book')) {
        productData.image = '📚'
      } else {
        productData.image = '🎁'
      }
    } else if (productData.image.startsWith('//')) {
      // Fix protocol-relative URLs
      productData.image = 'https:' + productData.image
    } else if (productData.image.startsWith('/')) {
      // Handle relative URLs
      const baseUrl = new URL(url)
      productData.image = baseUrl.origin + productData.image
    }

    // Return scraped data
    return new Response(
      JSON.stringify(productData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to scrape product',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})