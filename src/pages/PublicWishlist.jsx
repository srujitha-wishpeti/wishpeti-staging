import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Share2, Grid, List, Search } from 'lucide-react'; // 🚀 Added Search icon
import { supabase } from '../services/supabaseClient'; 
import { getWishlistItems } from '../services/wishlist';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import { fetchExchangeRate, saveCurrencyPreference } from '../utils/currency'; 
import Toast from '../components/ui/Toast';
import './WishlistPage.css'; 

export default function PublicWishlist() {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const { username } = useParams(); 
  const [items, setItems] = useState([]);
  const [creator, setCreator] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(''); // 🚀 Added Search State
  const [currency, setCurrency] = useState({ code: 'INR', rate: 1 });
  const location = useLocation();

  // --- Search Logic ---
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencyChange = async (newCode) => {
    try {
      const rate = await fetchExchangeRate(newCode);
      setCurrency({ code: newCode, rate });
      saveCurrencyPreference(newCode, rate);
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${creator?.display_name}'s Wishlist`, url: shareUrl });
      } catch (err) { console.log('Share failed', err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setToastMsg("Link copied to clipboard! 📋");
      setShowToast(true);
    }
  };

  useEffect(() => {
    const loadPublicWishes = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from('creator_profiles')
          .select('id, display_name, username')
          .eq('username', username.toLowerCase())
          .single();

        if (profile) {
          setCreator(profile);
          const data = await getWishlistItems(profile.id);
          setItems(data || []);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadPublicWishes();
  }, [username]);

  const handleAddToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    if (existingCart.some(c => c.id === item.id)) {
      setToastMsg("Already in your gift cart!");
      setShowToast(true);
      return;
    }
    const cleanPrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
    const itemToAdd = {
      ...item,
      price: isNaN(cleanPrice) ? 0 : cleanPrice,
      recipient_id: creator?.id,
      recipient_name: creator?.display_name,
      added_currency: currency.code,
      added_rate: currency.rate
    };
    localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemToAdd]));
    window.dispatchEvent(new Event('cartUpdated'));
    setToastMsg(`Added gift for ${creator?.display_name}! 🎁`);
    setShowToast(true);
  };

  if (loading) return <div className="loading-state">Finding the wishlist...</div>;
  if (!creator) return <div className="error-state"><h2>Oops! Wishlist not found.</h2></div>;

  return (
    <div className="wishlist-modern-page"> {/* 🚀 Changed to modern-page for centering */}
      <header className="wishlist-hero-card">
        <div className="hero-flex">
          {creator.avatar_url && (
                <img 
                src={creator.avatar_url} 
                alt={creator.display_name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '20px' }} 
                />
           )}
          <div className="user-branding">
            <h1 className="user-name-title">
              {creator.display_name}'s Wishlist
              <span className="handle">@{creator.username}</span>
            </h1>
            {creator.bio ? (
                <p className="creator-bio-text">{creator.bio}</p>
            ) : (
                <p className="creator-bio-placeholder">Welcome to my wishlist! ✨</p>
            )}
            <div className="hero-stats">
              <span>{items.length} items</span>
            </div>
          </div>
          
          <div className="header-actions-group">
            <select className="currency-dropdown-minimal" value={currency.code} onChange={(e) => handleCurrencyChange(e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
            <button className="modern-share-btn" onClick={handleShare}>
              <Share2 size={18} /> Share List
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 New Controls Section (Search + View Toggle) */}
      <section className="modern-controls-container">
        <div className="search-bar-wrapper">
          <Search size={20} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modern-search-input"
          />
        </div>
        
        <div className="controls-buttons-group">
          <div className="view-toggle-pills">
            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><Grid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List size={18} /></button>
          </div>
        </div>
      </section>

      <main className="wishlist-display-area">
        {filteredItems.length > 0 ? (
          <div className={`wishlist-container-${viewMode}`}>
            {filteredItems.map(item => (
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
          <div className="empty-state">No items found matching your search. ✨</div>
        )}
      </main>

      {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
}