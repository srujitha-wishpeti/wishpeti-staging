import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import AddItemButton from './AddItemButton';
import UrlInputForm from './UrlInputForm';

export default function AddWishlistItem({ 
  session, 
  onItemAdded, 
  categories, 
  initialData = null, 
  isEditing = false 
}) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [showForm, setShowForm] = useState(isEditing); 
  const [error, setError] = useState(null);
  const [scrapedData, setScrapedData] = useState(initialData || null);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || '');
  
  const [editableData, setEditableData] = useState({
    title: initialData?.title || '',
    price: initialData?.price || '',
    image: initialData?.image || initialData?.image_url || '',
    quantity: initialData?.quantity || 1,
    description: initialData?.notes || '',
    selectedSize: initialData?.variants?.selectedSize || '',
    selectedColor: initialData?.variants?.selectedColor || ''
  });

  useEffect(() => {
    if (initialData && isEditing) {
      setUrl(initialData.url || '');
      setScrapedData(initialData);
      setSelectedCategory(initialData.category || '');
      setEditableData({
        title: initialData.title || '',
        price: initialData.price || '',
        image: initialData.image || initialData.image_url || '',
        quantity: initialData.quantity || 1,
        description: initialData.notes || '',
        selectedSize: initialData.variants?.selectedSize || '',
        selectedColor: initialData.variants?.selectedColor || ''
      });
    }
  }, [initialData, isEditing]);

  const scrapeProduct = async (productUrl) => {
    if (isEditing) return; 
    setScraping(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('scrape-product', {
        body: { url: productUrl }
      });

      if (functionError) throw functionError;

      setScrapedData(data);
      setEditableData({
        title: data.title || '',
        price: data.price || '',
        image: data.image || '',
        quantity: 1,
        description: '',
        selectedSize: data.variants?.sizes?.[0] || '',
        selectedColor: data.variants?.colors?.[0] || ''
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
    if (!isEditing && newUrl.length > 10 && newUrl.startsWith('http')) {
      await scrapeProduct(newUrl);
    }
  };

  // Inside AddWishlistItem.jsx
const handleFinalAdd = async () => {
  setLoading(true);
  setError(null);

  try {
    const updatedData = {
      ...editableData,
      url: url,
      category: selectedCategory,
      brand: scrapedData?.brand || '',
      store: scrapedData?.store || '',
    };

    if (isEditing) {
      // 🚀 Pass the data back to WishlistPage's handleUpdateSubmit
      if (onItemAdded) await onItemAdded(updatedData);
    } else {
      // Normal Insert Logic
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert([{
          creator_id: session.user.id,
          url: url,
          title: editableData.title,
          price: editableData.price,
          image: editableData.image, // Fixed key
          notes: editableData.description, // Fixed key
          brand: scrapedData?.brand,
          store: scrapedData?.store,
          category: selectedCategory || scrapedData?.category,
          variants: {
            selectedSize: editableData.selectedSize,
            selectedColor: editableData.selectedColor
          }
      }]);

      if (insertError) throw insertError;
      if (onItemAdded) onItemAdded(); 
      resetForm();
    }
  } catch (err) {
    setError(err.message || 'Failed to save item');
  } finally {
    setLoading(false);
  }
};

const resetForm = () => {
  if (isEditing) {
    // 🚀 This triggers setEditingItem(null) in the parent
    if (onItemAdded) onItemAdded(null); 
  } else {
    setUrl('');
    setScrapedData(null);
    setShowForm(false);
    setError(null);
    setEditableData({ 
      title: '', price: '', image: '', quantity: 1, 
      description: '', selectedSize: '', selectedColor: '' 
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
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onContinue={handleFinalAdd}
          onCancel={resetForm}
          loading={loading}
          isEditing={isEditing}
        />
      )}
    </>
  );
}