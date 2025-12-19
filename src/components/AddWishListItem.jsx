// components/AddWishlistItem.jsx - Main Component
import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import AddItemButton from './AddItemButton';
import UrlInputForm from './UrlInputForm';
import OptionsSelectionPopup from './OptionsSelectionPopup';

export default function AddWishlistItem({ session, onItemAdded, categories }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);
  const [error, setError] = useState(null);
  const [scrapedData, setScrapedData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [userSelections, setUserSelections] = useState({
    size: '',
    color: '',
    material: '',
    style: '',
    customOptions: {}
  });

  // Scrape product from URL
  const scrapeProduct = async (productUrl) => {
    setScraping(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(
        `${supabaseUrl}/functions/v1/scrape-product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ url: productUrl })
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scrape product');
      }

      setScrapedData(data);
      
      // Initialize selections with default values
      setUserSelections({
        size: data.variants?.selectedSize || data.variants?.sizes?.[0] || '',
        color: data.variants?.selectedColor || data.variants?.colors?.[0] || '',
        material: data.variants?.selectedMaterial || data.variants?.materials?.[0] || '',
        style: data.variants?.selectedStyle || data.variants?.styles?.[0] || '',
        customOptions: {}
      });
    } catch (err) {
      console.error('Scraping error:', err);
      setError(err.message);
      setScrapedData(null);
    } finally {
      setScraping(false);
    }
  };

  const handleUrlChange = async (newUrl) => {
    setUrl(newUrl);
    setError(null);
    
    if (newUrl.length > 20 && (newUrl.includes('http://') || newUrl.includes('https://'))) {
      try {
        new URL(newUrl);
        await scrapeProduct(newUrl);
      } catch {
        // Invalid URL
      }
    } else {
      setScrapedData(null);
    }
  };

  const handleContinueToOptions = () => {
    if (!scrapedData) {
      alert('Please enter a valid product URL');
      return;
    }
    
    // Check if there are options to select
    const hasVariants = scrapedData.variants && (
      (scrapedData.variants.sizes && scrapedData.variants.sizes.length > 0) ||
      (scrapedData.variants.colors && scrapedData.variants.colors.length > 0) ||
      (scrapedData.variants.materials && scrapedData.variants.materials.length > 0) ||
      (scrapedData.variants.styles && scrapedData.variants.styles.length > 0)
    );
    
    const hasCustomOptions = scrapedData.customOptions && scrapedData.customOptions.length > 0;
    
    if (hasVariants || hasCustomOptions) {
      setShowOptionsPopup(true);
    } else {
      // No options, add directly
      handleFinalAdd();
    }
  };

  const handleFinalAdd = async () => {
    setLoading(true);
    setError(null);

    try {
      const finalVariants = {
        ...scrapedData.variants,
        selectedSize: userSelections.size,
        selectedColor: userSelections.color,
        selectedMaterial: userSelections.material,
        selectedStyle: userSelections.style
      };

      const finalCustomOptions = scrapedData.customOptions?.map(option => ({
        ...option,
        selected: userSelections.customOptions[option.label] || option.selected
      }));

      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert([
          {
            creator_id: session.user.id,
            url: scrapedData.url,
            title: scrapedData.title,
            price: scrapedData.price,
            original_price: scrapedData.originalPrice,
            discount: scrapedData.discount,
            image: scrapedData.image,
            brand: scrapedData.brand,
            store: scrapedData.store,
            category: selectedCategory || scrapedData.category,
            variants: finalVariants,
            custom_options: finalCustomOptions,
            specifications: scrapedData.specifications,
            rating: scrapedData.rating,
            reviews: scrapedData.reviews,
            availability: scrapedData.availability
          }
        ]);

      if (insertError) throw insertError;

      // Reset and close
      resetForm();
      onItemAdded && onItemAdded();
    } catch (err) {
      console.error('Add item error:', err);
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setScrapedData(null);
    setSelectedCategory('');
    setShowForm(false);
    setShowOptionsPopup(false);
    setUserSelections({
      size: '',
      color: '',
      material: '',
      style: '',
      customOptions: {}
    });
    setError(null);
  };

  const updateSelection = (field, value) => {
    setUserSelections(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCustomOption = (label, value) => {
    setUserSelections(prev => ({
      ...prev,
      customOptions: {
        ...prev.customOptions,
        [label]: value
      }
    }));
  };

  return (
    <>
      {/* Add Button */}
      {!showForm && <AddItemButton onClick={() => setShowForm(true)} />}

      {/* URL Input Form */}
      {showForm && !showOptionsPopup && (
        <UrlInputForm
          url={url}
          onUrlChange={handleUrlChange}
          scrapedData={scrapedData}
          scraping={scraping}
          error={error}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onContinue={handleContinueToOptions}
          onCancel={resetForm}
          loading={loading}
        />
      )}

      {/* Options Selection Popup */}
      {showOptionsPopup && scrapedData && (
        <OptionsSelectionPopup
          product={scrapedData}
          selections={userSelections}
          onSelectionChange={updateSelection}
          onCustomOptionChange={updateCustomOption}
          onBack={() => setShowOptionsPopup(false)}
          onConfirm={handleFinalAdd}
          loading={loading}
        />
      )}
    </>
  );
}