import React, { useEffect, useState } from 'react';
import { Search, Grid, List, Share2, Plus } from 'lucide-react';
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

export default function WishlistPage() {
  const { session } = useAuth();
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
  
  // 🔑 1. Added Currency State
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

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

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  useEffect(() => {
    let filtered = wishlist;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredWishlist(filtered);
  }, [wishlist, activeCategory, searchQuery]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/wishlist/${profile?.username || session.user.id}`;
    if (navigator.share) {
      await navigator.share({ title: `${profile?.display_name}'s Wishlist`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setToastMsg("Link copied! 🔗");
      setShowToast(true);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Remove this item?')) return;
    await deleteWishlistItem(itemId);
    loadData();
  };

  // 🔑 2. Updated to include currency and notify Navbar
  const handleAddToCart = async (item) => {
    try {
      const priceVal = typeof item.price === 'string' ? Number(item.price.replace(/[^\d.]/g, '')) : item.price;
      
      const itemWithCurrency = {
        user_id: session.user.id,
        product_id: item.id,
        quantity: 1,
        price: priceVal,
        currency: selectedCurrency, // 🔑 Store the user's choice
        image_url: item.image_url || item.image,
        title: item.title,
        recipient_id: session.user.id, // For admin, recipient is self
        variants: item.variants || {}
      };

      // Update LocalStorage for instant Navbar update
      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemWithCurrency]));

      // Save to DB
      await addToCart(itemWithCurrency);

      // 🔥 3. Notify Navbar to refresh the badge count
      window.dispatchEvent(new Event('cartUpdated'));

      setToastMsg(`Added to your cart in ${selectedCurrency}! 🎁`);
      setShowToast(true);
    } catch (err) {
      setToastMsg("Failed to add gift to cart.");
      setShowToast(true);
    }
  };

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
              {/* Note: In production, you'd convert this total based on selectedCurrency */}
              <span>₹{stats?.totalValue?.toLocaleString() || 0} total</span>
            </div>
          </div>
          
          <div className="header-actions-group">
            {/* 🔑 4. Currency Selector added to Header */}
            <select 
              className="currency-dropdown-minimal"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
            </select>

            <button className="modern-share-btn" onClick={handleShare}>
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
          <AddWishlistItem session={session} onItemAdded={loadData} categories={[]} />
        </div>
      </section>

      <main className="wishlist-display-area">
        {loading ? (
          <div className="loading-state">Loading your wishes...</div>
        ) : (
          <div className={`wishlist-container-${viewMode}`}>
            {filteredWishlist.length > 0 ? (
              filteredWishlist.map(item => (
                <WishlistItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDelete} 
                  onAddToCart={handleAddToCart}
                  forcedCurrency={selectedCurrency} // 🔑 5. Pass currency to Card for display
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No items found. Time to add some wishes! ✨</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showToast && (
        <Toast 
          message={toastMsg} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
}