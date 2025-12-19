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
  
  // NEW: Initialize editable state to prevent "undefined" errors
  const [editableData, setEditableData] = useState({
    title: '',
    price: '',
    image: '',
    quantity: 1,
    description: '',
    selectedSize: '',
    selectedColor: ''
  });

  const [userSelections, setUserSelections] = useState({
    size: '',
    color: '',
    material: '',
    style: '',
    customOptions: {}
  });

  const scrapeProduct = async (productUrl) => {
    setScraping(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('scrape-product', {
        body: { url: productUrl }
      });

      if (functionError) throw functionError;

      setScrapedData(data);
      
      // NEW: Fill the editable state with scraped values
      setEditableData({
        title: data.title || '',
        price: data.price || '',
        image: data.image || '',
        quantity: 1,
        description: '',
        selectedSize: data.variants?.sizes?.[0] || '',
        selectedColor: data.variants?.colors?.[0] || ''
      });

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
    } finally {
      setScraping(false);
    }
  };

  const handleUrlChange = async (newUrl) => {
    setUrl(newUrl);
    setError(null);
    if (newUrl.length > 10 && newUrl.startsWith('http')) {
      await scrapeProduct(newUrl);
    } else {
      setScrapedData(null);
    }
  };

  const handleFinalAdd = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert([{
          creator_id: session.user.id,
          url: url,
          // Save the EDITED values, not the raw scraped ones
          title: editableData.title,
          price: editableData.price,
          image: editableData.image,
          brand: scrapedData.brand,
          store: scrapedData.store,
          category: selectedCategory || scrapedData.category,
          variants: {
            ...scrapedData.variants,
            selectedSize: editableData.selectedSize,
            selectedColor: editableData.selectedColor
          },
          availability: scrapedData.availability
        }]);

      if (insertError) throw insertError;
      resetForm();
      onItemAdded && onItemAdded();
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setScrapedData(null);
    setShowForm(false);
    setError(null);
    setEditableData({ title: '', price: '', image: '', quantity: 1, description: '', selectedSize: '', selectedColor: '' });
  };

  return (
    <>
      {!showForm && <AddItemButton onClick={() => setShowForm(true)} />}

      {showForm && (
        <UrlInputForm
          url={url}
          onUrlChange={handleUrlChange}
          scrapedData={scrapedData}
          editableData={editableData} // Passed correctly
          setEditableData={setEditableData} // Passed correctly
          scraping={scraping}
          error={error}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onContinue={handleFinalAdd}
          onCancel={resetForm}
          loading={loading}
        />
      )}
    </>
  );
}