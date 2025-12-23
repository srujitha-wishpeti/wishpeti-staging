import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import AddItemButton from './AddItemButton';
import UrlInputForm from './UrlInputForm';
import { getCurrencySymbol } from '../utils/currency';
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
    is_crowdfund: false
  });

  // Sync state when entering Edit Mode
  useEffect(() => {
    if (initialData && isEditing) {
      setShowForm(true);
      setUrl(initialData.url || '');
      setScrapedData(initialData);
      setEditableData({
        title: initialData.title || '',
        price: initialData.price ? (initialData.price * currency.rate).toFixed(2) : '',
        image: initialData.image || initialData.image_url || '',
        quantity: initialData.quantity || 1,
        notes: initialData.notes || '',
        selectedSize: initialData.variants?.selectedSize || '',
        selectedColor: initialData.variants?.selectedColor || '',
        is_crowdfund: initialData.is_crowdfund || false
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

      const rawPriceText = data.price_raw || data.price || "";
      const numericValue = parseFloat(rawPriceText.toString().replace(/[^\d.]/g, '')) || 0;
      
      let priceInINR = numericValue;
      if (rawPriceText.includes('$')) {
        priceInINR = numericValue * 90.73; 
      }

      const displayValue = (priceInINR * currency.rate).toFixed(2);

      setEditableData(prev => ({
        ...prev,
        title: data.title || '',
        price: displayValue, 
        image: data.image || '',
        is_crowdfund: false
      }));
      
      setScrapedData(data);
    } catch (err) {
      setError("Manual entry required for price.");
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

  const handleFinalAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Clean the input price (unit price)
      const unitPrice = parseFloat(editableData.price.toString().replace(/[^\d.]/g, '')) || 0;
      const qty = parseInt(editableData.quantity, 10) || 1;

      // 2. Convert the UNIT PRICE back to base INR for Supabase
      // We no longer multiply by quantity here.
      const priceInINR = currency.code !== 'INR' 
        ? parseFloat((unitPrice / currency.rate).toFixed(2)) 
        : unitPrice;

      const updatedData = {
        title: editableData.title,
        price: priceInINR,         // SAVES UNIT PRICE ONLY
        quantity: qty,             // SAVES ACTUAL QUANTITY (e.g., 5)
        currency_code: currency.code,
        url: url,
        image: editableData.image,
        notes: editableData.notes,
        is_crowdfund: editableData.is_crowdfund,
        // Status logic: if quantity is 0, it's claimed
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