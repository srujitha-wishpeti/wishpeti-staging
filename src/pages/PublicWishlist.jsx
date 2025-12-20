import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Share2, Grid, List } from 'lucide-react'; // 🚀 Added for UI Icons
import { supabase } from '../services/supabaseClient'; 
import { getWishlistItems } from '../services/wishlist';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import { fetchExchangeRate } from '../utils/currency'; 
import { getCurrencyPreference, saveCurrencyPreference } from '../utils/currency';
import Toast from '../components/ui/Toast';
import './WishlistPage.css'; 
import './PublicWishlist.css'; 

export default function PublicWishlist() {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const { username } = useParams(); 
  const [items, setItems] = useState([]);
  const [creator, setCreator] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 🚀 State for Grid/List toggle
  const location = useLocation();

  const [currency, setCurrency] = useState({ code: 'INR', rate: 1 });

  const handleCurrencyChange = async (newCode) => {
    try {
      const rate = await fetchExchangeRate(newCode);
      setCurrency({ code: newCode, rate });
      saveCurrencyPreference(newCode, rate);
      window.dispatchEvent(new Event('currencyChanged'));
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator?.display_name}'s Wishlist`,
          url: shareUrl,
        });
      } catch (err) { console.log('Share failed', err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setToastMsg("Link copied to clipboard! 📋");
      setShowToast(true);
    }
  };

  // ... (Keep existing UseEffects for item highlighting and data loading)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const itemId = queryParams.get('item');

    if (itemId && !loading && items.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`item-${itemId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-focus');
          setTimeout(() => element.classList.remove('highlight-focus'), 3000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.search, loading, items]);

  useEffect(() => {
    const loadPublicWishes = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const { data: profile, error: profileError } = await supabase
          .from('creator_profiles')
          .select('id, display_name, username, created_at')
          .eq('username', username.toLowerCase())
          .single();

        if (profileError || !profile) {
          setLoading(false);
          return;
        }

        setCreator(profile);
        const data = await getWishlistItems(profile.id);
        setItems(data || []);
      } catch (err) {
        console.error("Error loading public list:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPublicWishes();
  }, [username]);

  const handleAddToCart = (item) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      const isDuplicate = existingCart.some(cartItem => cartItem.id === item.id);
      
      if (isDuplicate) {
        setToastMsg("Item is already in your gift cart!");
        setShowToast(true);
        return;
      }

      let cleanPrice = item.price;
      if (typeof cleanPrice === 'string') {
        cleanPrice = parseFloat(cleanPrice.replace(/[^\d.]/g, ''));
      }
      
      const finalPrice = isNaN(cleanPrice) ? 0 : cleanPrice;

      const itemToAdd = {
        ...item,
        price: finalPrice, 
        recipient_id: creator?.id || item.user_id, 
        recipient_name: creator?.display_name || 'Verified Creator',
        added_currency: currency.code,
        added_rate: currency.rate,
        addedAt: new Date().getTime()
      };

      const updatedCart = [...existingCart, itemToAdd];
      localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));

      window.dispatchEvent(new Event('cartUpdated'));
      setToastMsg(`Added to your gift cart for ${creator?.display_name}! 🎁`);
      setShowToast(true);

    } catch (err) {
      console.error("Cart error:", err);
      setToastMsg("Failed to add gift to cart.");
      setShowToast(true);
    }
  };

  if (loading) return <div className="loading-state">Finding the wishlist...</div>;
  if (!creator) return <div className="error-state"><h2>Oops! Wishlist not found.</h2></div>;

  return (
    <div className="wishlist-page">
      <header className="wishlist-hero-card">
        <div className="hero-flex">
          <div className="user-branding">
            <h1 className="user-name-title">
              {creator.display_name}'s Wishlist
              <span className="handle">@{creator.username}</span>
            </h1>
            <div className="hero-stats">
              <span>{items.length} items</span>
            </div>
          </div>
          
          <div className="header-actions-group">
            {/* 🚀 Currency Selector matching your image style */}
            <select 
              className="currency-dropdown-minimal"
              value={currency.code} 
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            {/* 🚀 Share List Button */}
            <button className="modern-share-btn" onClick={handleShare}>
              <Share2 size={18} />
              <span>Share List</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Grid/List View Toggle Group */}
      <section className="modern-controls-container" style={{ justifyContent: 'center' }}>
        <div className="view-toggle-pills">
          <button 
            onClick={() => setViewMode('grid')} 
            className={viewMode === 'grid' ? 'active' : ''}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            className={viewMode === 'list' ? 'active' : ''}
          >
            <List size={18} />
          </button>
        </div>
      </section>

      <main className="wishlist-display-area">
        {items.length > 0 ? (
          <div className={`wishlist-container-${viewMode}`}>
            {items.map(item => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={() => handleAddToCart(item)}
                isPublicView={true} 
                username={username}
                currencySettings={currency} 
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No wishes found yet. ✨</p>
          </div>
        )}
      </main>

      {showToast && (
        <Toast message={toastMsg} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}