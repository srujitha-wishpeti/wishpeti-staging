import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Grid, List, Share2 } from 'lucide-react';
import AddWishlistItem from '../components/AddWishlistItem';
import { useAuth } from '../auth/AuthProvider';

import { 
  getWishlistItems, 
  deleteWishlistItem, 
  getWishlistStats 
} from '../services/wishlist';
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import { supabase } from '../services/supabaseClient';
import './WishlistPage.css';
import Toast from '../components/ui/Toast';
import { saveCurrencyPreference, fetchExchangeRate, getCurrencyPreference } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';

export default function WishlistPage() {
  const { session } = useAuth();
  const location = useLocation();
  
  // States
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // 🚀 Live Currency State
  const { currency, updateCurrency } = useCurrency();
  const [editingItem, setEditingItem] = useState(null);

  // --- Functions ---

  // 🚀 Update Currency and Rate
  const handleCurrencyChange = async (newCode) => {
    try {
      // updateCurrency in the context handles saving & fetching automatically
      await updateCurrency(newCode); 
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  const handleUpdateSubmit = async (updatedItemData) => {
    if (!updatedItemData) {
        setEditingItem(null);
        return;
    }

    try {
        const { error } = await supabase
        .from('wishlist_items')
        .update({
            title: updatedItemData.title,
            price: updatedItemData.price,
            notes: updatedItemData.description,
            url: updatedItemData.url,
            brand: updatedItemData.brand,
            category: updatedItemData.category,
            image: updatedItemData.image,
            variants: {
            selectedSize: updatedItemData.selectedSize,
            selectedColor: updatedItemData.selectedColor
            }
        })
        .eq('id', editingItem.id);

        if (error) throw error;

        setEditingItem(null); 
        loadData();           
        setToastMsg("Wish updated! ✨");
        setShowToast(true);
    } catch (err) {
        console.error(err);
        setToastMsg("Error updating item.");
        setShowToast(true);
    }
  };

  const loadData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [items, statistics, profileData] = await Promise.all([
        getWishlistItems(session.user.id),
        getWishlistStats(session.user.id),
        supabase.from('creator_profiles').select('display_name, username').eq('id', session.user.id).single()
      ]);
      setWishlist(items);
      setFilteredWishlist(items);
      setStats(statistics);
      setProfile(profileData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // 🚀 Clean Price Sanitizer
      let cleanPrice = item.price;
      if (typeof cleanPrice === 'string') {
        cleanPrice = parseFloat(cleanPrice.replace(/[^\d.]/g, ''));
      }
      const finalPrice = isNaN(cleanPrice) ? 0 : cleanPrice;
      
      const itemWithCurrency = {
        ...item,
        price: finalPrice,
        added_currency: currency.code,
        added_rate: currency.rate,
        recipient_id: session.user.id,
        addedAt: new Date().getTime()
      };

      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemWithCurrency]));
      
      window.dispatchEvent(new Event('cartUpdated'));
      setToastMsg(`Added to cart in ${currency.code}! 🎁`);
      setShowToast(true);
    } catch (err) {
      setToastMsg("Failed to add to cart.");
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  return (
    <div className="wishlist-modern-page">
      <header className="wishlist-hero-card">
        <div className="hero-flex">
          <div className="user-branding">
            <h1 className="user-name-title">
              {profile?.display_name || 'My Wishlist'} 
              <span className="handle">@{profile?.username}</span>
            </h1>
            <div className="hero-stats">
              <span>{stats?.totalItems || 0} items</span>
              <span className="dot"></span>
              {/* 🚀 Dynamic Total Value Display */}
              <span>
                {currency.code === 'INR' ? '₹' : currency.code + ' '}
                {((stats?.totalValue || 0) * currency.rate).toLocaleString(undefined, { minimumFractionDigits: currency.code === 'INR' ? 0 : 2 })}
              </span>
            </div>
          </div>
          
          <div className="header-actions-group">
            {/* 🚀 Updated Currency Dropdown */}
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

            <button className="modern-share-btn" onClick={() => {
                const shareUrl = `${window.location.origin}/wishlist/${profile?.username}`;
                navigator.clipboard.writeText(shareUrl);
                setToastMsg("Link copied! 🔗");
                setShowToast(true);
            }}>
              <Share2 size={18} /> Share List
            </button>
          </div>
        </div>
      </header>

      <section className="modern-controls-container">
        <div className="search-bar-wrapper">
          <Search size={20} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search for an item..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modern-search-input"
          />
        </div>
        
        <div className="controls-buttons-group">
          <div className="view-toggle-pills">
            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><Grid size={18}/></button>
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List size={18}/></button>
          </div>
          <AddWishlistItem session={session} onItemAdded={loadData} categories={[]} currency={currency} />
        </div>
      </section>

      <main className="wishlist-display-area">
        {loading ? (
          <div className="loading-state">Loading your wishes...</div>
        ) : (
          <div className={`wishlist-container-${viewMode}`}>
            {wishlist.map(item => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onDelete={(id) => {
                    deleteWishlistItem(id).then(loadData);
                }} 
                onAddToCart={handleAddToCart}
                onEdit={(item) => setEditingItem(item)}
                // 🚀 Pass the dynamic currency settings
                currencySettings={currency}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </main>

      {editingItem && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Edit Your Wish</h3>
              <button onClick={() => setEditingItem(null)} className="close-btn">×</button>
            </div>
            <AddWishlistItem 
                session={session} 
                onItemAdded={handleUpdateSubmit} 
                initialData={editingItem} 
                isEditing={true}
                currency={currency}
            />
          </div>
        </div>
      )}

      {showToast && (
        <Toast 
          message={toastMsg} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
}