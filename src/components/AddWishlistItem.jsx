import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import AddItemButton from './AddItemButton';
import UrlInputForm from './UrlInputForm';
import { getCurrencySymbol, convertAmount } from '../utils/currency';
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ setCurrency, allRates] = useCurrency();

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
      setSelectedCategory(initialData.category || '');
      setEditableData({
        title: initialData.title || '',
        price: convertAmount(
          initialData.price, // This is the base INR from DB
          'INR', 
          currency.code, 
          allRates
        ),
        image: initialData.image || initialData.image_url || '',
        quantity: initialData.quantity || 1,
        notes: initialData.notes || '',
        selectedSize: initialData.variants?.selectedSize || '',
        selectedColor: initialData.variants?.selectedColor || '',
        is_crowdfund: initialData.is_crowdfund || false
      });
    }
  }, [initialData, isEditing, currency.rate]);

  // THE SCRAPER LOGIC
  const scrapeProduct = async (productUrl) => {
    if (isEditing) return;
    setScraping(true);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('scrape-product', {
        body: { url: productUrl }
      });

      if (functionError) throw functionError;

      // 1. Get the raw text (e.g., "$44.00")
      const rawPriceText = data.price_raw || data.price || "";
      const numericValue = parseFloat(rawPriceText.toString().replace(/[^\d.]/g, '')) || 0;

      // 2. Determine the "Source of Truth"
      let priceInINR = numericValue;
      
      // If the scraper found a $, convert it to your base (INR) first.
      // If it didn't find a $, assume it's already INR.
      if (rawPriceText.includes('$') || productUrl.includes('.com')) {
        priceInINR = numericValue * 89.73; // Use a fixed base rate or an API
      }

      // 3. Now convert that INR base to whatever the USER wants to see
      // If user preference is USD, math is: (numericValue * 83.5) / 83.5 = numericValue (44!)
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
    // Trigger scrape only for new items
    if (!isEditing && newUrl.length > 10 && newUrl.startsWith('http')) {
      await scrapeProduct(newUrl);
    }
  };
  

  const handleFinalAdd = async () => {
    setLoading(true);
    try {
      // 1. Get the price as a clean number
      const inputVal = parseFloat(editableData.price.toString().replace(/[^\d.]/g, '')) || 0;

      // 2. Convert back to base INR for Supabase
      // Using Math.ceil ensures that $43.9999 becomes the higher INR value
      const priceInINR = currency.code !== 'INR' 
        ? Math.ceil(inputVal / currency.rate) 
        : Math.ceil(inputVal);


      const updatedData = {
        title: editableData.title,
        price: priceInINR, // This is now safely rounded up
        url: url,
        image: editableData.image,
        notes: editableData.notes,
        is_crowdfund: editableData.is_crowdfund,
          variants: {
            selectedSize: editableData.selectedSize,
            selectedColor: editableData.selectedColor
          }
        };

        if (isEditing) {
          await supabase.from('wishlist_items').update(updatedData).eq('id', initialData.id);
        } else {
          await supabase.from('wishlist_items').insert([{ ...updatedData, creator_id: session.user.id }]);
        }
        
        onItemAdded(); 
        if (!isEditing) resetForm();

      } catch (err) {
        setError("Failed to save.");
      } finally {
        setLoading(false);
      }
  };

  const resetForm = () => {
    if (isEditing) {
      onItemAdded(); // This acts as the close signal for the parent
    } else {
      setShowForm(false);
      setUrl('');
      setScrapedData(null);
      setEditableData({ title: '', price: '', image: '', quantity: 1, notes: '', selectedSize: '', selectedColor: '', is_crowdfund: false });
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
          currencySymbol= {getCurrencySymbol(currency.code)}
          currencyCode={currency.code}
        />
      )}
    </>
  );
}