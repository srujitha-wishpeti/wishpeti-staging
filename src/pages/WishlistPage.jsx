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

export default function WishlistPage() {
  const { session } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null); // 🔑 Added to store user profile

  const categories = [
    { id: 'all', name: 'All Wishes', icon: '🎁', color: '#8b5cf6' },
    { id: 'electronics', name: 'Electronics', icon: '💻', color: '#3b82f6' },
    { id: 'fashion', name: 'Fashion', icon: '👕', color: '#ec4899' },
    { id: 'home', name: 'Home & Living', icon: '🏠', color: '#10b981' },
    { id: 'books', name: 'Books', icon: '📚', color: '#f59e0b' },
    { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#8b5cf6' },
    { id: 'general', name: 'Other', icon: '🛍️', color: '#6b7280' },
  ];

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

  // Filtering Logic
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
      alert("Link copied! 🔗");
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Remove this item?')) return;
    await deleteWishlistItem(itemId);
    loadData();
  };

  const handleAddToCart = async (item) => {
    try {
      const priceVal = typeof item.price === 'string' ? Number(item.price.replace(/[^\d]/g, '')) : item.price;
      await addToCart({
        user_id: session.user.id,
        product_id: item.id,
        quantity: 1,
        price: priceVal,
        image_url: item.image_url,
        title: item.title,
        variants: item.variants || {}
      });
      alert('Added to cart ✅');
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  return (
    <div className="wishlist-modern-page">
      {/* 1. Clean Header */}
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
          <button className="modern-share-btn" onClick={handleShare}>
            <Share2 size={18} /> Share List
          </button>
        </div>
      </header>

      {/* 2. Focused Controls (No Category Bar here) */}
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
          {/* Note: Pass an empty array or remove the category prop if AddWishlistItem expects it */}
          <AddWishlistItem session={session} onItemAdded={loadData} categories={[]} />
        </div>
      </section>

      {/* 3. The Grid */}
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
    </div>
  );
}