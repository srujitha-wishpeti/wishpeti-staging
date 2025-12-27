import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import AddItemButton from './AddItemButton';
import UrlInputForm from './UrlInputForm';
import { getCurrencySymbol, getBaseInrSync } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';

export default function AddWishlistItem({ 
  session, 
  onItemAdded, 
  categories, 
  initialData = null, 
  isEditing = false,
  currency = { code: 'INR', rate: 1 }
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [showForm, setShowForm] = useState(false); 
  const [error, setError] = useState(null);
  const [scrapedData, setScrapedData] = useState(null);
  const { setCurrency } = useCurrency();

  const [editableData, setEditableData] = useState({
    title: '',
    price: '',
    image: '',
    quantity: 1,
    notes: '',
    selectedSize: '',
    selectedColor: '',
    is_crowdfund: false,
    amount_raised: 0
  });

  // Sync state when entering Edit Mode
  useEffect(() => {
    if (initialData && isEditing) {
      const BUFFER_MULTIPLIER = 1.18; //includes platform fee of 18%
    
      // 1. Get the stored buffered price (which is always in base INR)
      const rawPrice = parseFloat(initialData.price) || 0;
      
      // 2. Remove the 18% buffer to get the original base price
      const originalBasePrice = rawPrice / BUFFER_MULTIPLIER;

      // 3. Convert that original price to the current viewing currency
      // This ensures if you open the edit modal while in 'USD' mode, you see the correct USD price
      const displayPrice = (originalBasePrice * currency.rate).toFixed(2);
      setShowForm(true);
      setUrl(initialData.url || '');
      setScrapedData(initialData);
      setEditableData({
        title: initialData.title || '',
        price: displayPrice,
        image: initialData.image || initialData.image_url || '',
        quantity: initialData.quantity || 1,
        notes: initialData.notes || '',
        selectedSize: initialData.variants?.selectedSize || '',
        selectedColor: initialData.variants?.selectedColor || '',
        is_crowdfund: initialData.is_crowdfund || false,
        amount_raised: initialData.amount_raised || 0
      });
    }
  }, [initialData, isEditing, currency.rate]);

  const scrapeProduct = async (productUrl) => {
    if (isEditing) return;
    setScraping(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('scrape-product', {
        body: { url: productUrl }
      });

      if (functionError) throw functionError;

      const rawPriceText = (data.price_raw || data.price || "").toString();
      console.log("Scraped Raw Price:", rawPriceText); // "USD 14"

      const numericValue = parseFloat(rawPriceText.replace(/[^\d.]/g, '')) || 0;
      
      // Improved detection for "USD 14" or "$14"
      const isUSD = rawPriceText.includes('USD') || rawPriceText.includes('$');
      const isGBP = rawPriceText.includes('GBP') || rawPriceText.includes('£');
      const isEUR = rawPriceText.includes('EUR') || rawPriceText.includes('€');

      const symbol = isUSD ? '$' : isGBP ? '£' : isEUR ? '€' : '₹';

      // 1. Get Base INR using the local storage sync function
      const baseInrValue = getBaseInrSync(numericValue, symbol);

      // 2. Convert to User's Viewing Currency
      const displayValue = (baseInrValue * currency.rate).toFixed(2);

      setEditableData({
        title: data.title || '',
        price: (displayValue === "0.00" || displayValue < 1) ? '' : displayValue,
        image: data.image || '',
        quantity: 1,
        notes: '',
        selectedSize: '',
        selectedColor: '',
        is_crowdfund: false
      });
      
      if (parseFloat(displayValue) <= 0) {
        setError("Manual entry required for price.");
      }

      setScrapedData(data);
      setShowForm(true); 
    } catch (err) {
      console.error("Scrape Error:", err);
      setError("Manual entry required for price.");
      setShowForm(true); // Open form on error
      
      setEditableData({
        title: '',
        price: '',
        image: '',
        quantity: 1,
        notes: '',
        selectedSize: '',
        selectedColor: '',
        is_crowdfund: false
      });
    } finally {
      setScraping(false);
    }
  };
  const handleUrlChange = async (newUrl) => {
    setUrl(newUrl);
    if (!isEditing && newUrl.length > 10 && newUrl.startsWith('http')) {
      await scrapeProduct(newUrl);
    }
  };

  const calculateRealCost = (basePrice) => {
    const price = parseFloat(basePrice) || 0;
    const SHIPPING_ESTIMATE = 0.05; // 5%
    const TAX_BUFFER = 0.10;       // 10%
    const GATEWAY_FEES = 0.03;      // 3%
    
    const totalBuffer = 1 + SHIPPING_ESTIMATE + TAX_BUFFER + GATEWAY_FEES;
    return (price * totalBuffer); 
  };

  const handleFinalAdd = async () => {
    setLoading(true);
    setError(null);
    
    // Define your buffer constants clearly
    const SHIPPING = 0.05; 
    const TAX = 0.10;       
    const GATEWAY = 0.03;      
    const TOTAL_BUFFER = 1 + SHIPPING + TAX + GATEWAY; // 1.18

    try {
        // 1. Clean the input price from the user
        const inputPrice = parseFloat(editableData.price.toString().replace(/[^\d.]/g, '')) || 0;
        const qty = parseInt(editableData.quantity, 10) || 1;

        // 2. Convert input to base INR (if it was entered in another currency)
        let basePriceINR = currency.code !== 'INR' 
            ? inputPrice / currency.rate 
            : inputPrice;

        // 3. Apply the 18% Buffer
        const finalBufferedPrice = parseFloat((basePriceINR * TOTAL_BUFFER).toFixed(2));

        const updatedData = {
            title: editableData.title,
            price: finalBufferedPrice, // Saved with the buffer
            quantity: qty,
            currency_code: 'INR',
            url: url,
            image: editableData.image,
            notes: editableData.notes,
            is_crowdfund: editableData.is_crowdfund,
            status: qty > 0 ? 'available' : 'claimed',
            variants: {
                selectedSize: editableData.selectedSize,
                selectedColor: editableData.selectedColor
            }
        };

        if (isEditing) {
            const { error: updateErr } = await supabase
                .from('wishlist_items')
                .update(updatedData)
                .eq('id', initialData.id);
            if (updateErr) throw updateErr;
        } else {
            const { error: insertErr } = await supabase
                .from('wishlist_items')
                .insert([{ ...updatedData, creator_id: session.user.id }]);
            if (insertErr) throw insertErr;
        }
        
        onItemAdded(); 
        if (!isEditing) resetForm();

    } catch (err) {
        setError("Failed to save: " + err.message);
    } finally {
        setLoading(false);
    }
};

  const resetForm = () => {
    if (isEditing) {
      onItemAdded(); 
    } else {
      setShowForm(false);
      setUrl('');
      setScrapedData(null);
      setError(null);
      setEditableData({ 
        title: '', 
        price: '', 
        image: '', 
        quantity: 1, 
        notes: '', 
        selectedSize: '', 
        selectedColor: '', 
        is_crowdfund: false 
      });
    }
  };

  return (
    <>
      {!showForm && !isEditing && (
        <AddItemButton onClick={() => setShowForm(true)} />
      )}

      {showForm && (
        <UrlInputForm
          url={url}
          onUrlChange={handleUrlChange}
          scrapedData={scrapedData}
          editableData={editableData}
          setEditableData={setEditableData}
          scraping={scraping}
          error={error}
          onContinue={handleFinalAdd}
          onCancel={resetForm}
          loading={loading}
          isEditing={isEditing}
          currencySymbol={getCurrencySymbol(currency.code)}
          currencyCode={currency.code}
        />
      )}
    </>
  );
}