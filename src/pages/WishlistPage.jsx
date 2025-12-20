import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [editingItem, setEditingItem] = useState(null);

  // --- Functions ---

  const handleUpdateSubmit = async (updatedItemData) => {
    // 🚀 FIX: If updatedItemData is null (User clicked Cancel/X), just close and exit
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
            notes: updatedItemData.description, // Match your state key
            url: updatedItemData.url,
            brand: updatedItemData.brand,
            category: updatedItemData.category,
            image: updatedItemData.image, // Match your state key
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

  const handleDeepLink = (items) => {
    const params = new URLSearchParams(location.search);
    const itemId = params.get('item');

    if (itemId && items.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`item-${itemId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-focus');
          setTimeout(() => {
            element.classList.remove('highlight-focus');
          }, 3000);
        }
      }, 500);
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

      handleDeepLink(items);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddToCart = async (item) => {
    try {
      const priceVal = typeof item.price === 'string' ? Number(item.price.replace(/[^\d.]/g, '')) : item.price;
      
      const itemWithCurrency = {
        user_id: session.user.id,
        product_id: item.id,
        quantity: 1,
        price: priceVal,
        currency: selectedCurrency,
        image: item.image_url || item.image,
        title: item.title,
        recipient_id: session.user.id,
        variants: item.variants || {}
      };

      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemWithCurrency]));
      await addToCart(itemWithCurrency);
      window.dispatchEvent(new Event('cartUpdated'));

      setToastMsg(`Added to your cart in ${selectedCurrency}! 🎁`);
      setShowToast(true);
    } catch (err) {
      setToastMsg("Failed to add gift to cart.");
      setShowToast(true);
    }
  };

  // --- Effects ---

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
              <span>₹{stats?.totalValue?.toLocaleString() || 0} total</span>
            </div>
          </div>
          
          <div className="header-actions-group">
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
                  onEdit={(item) => setEditingItem(item)}
                  forcedCurrency={selectedCurrency}
                  username={profile?.username || session?.user?.id}
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