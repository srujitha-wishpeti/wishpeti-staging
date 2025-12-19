import React, { useEffect, useState } from 'react';
import { Search, Grid, List, Share2 } from 'lucide-react';
import AddWishlistItem from '../components/AddWishlistItem';
import { useAuth } from '../auth/AuthProvider';
import { 
  getWishlistItems, 
  deleteWishlistItem, 
  updateItemVariants,
  getWishlistStats 
} from '../services/wishlist';
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
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

  const categories = [
    { id: 'all', name: 'All Wishes', icon: '🎁', color: '#8b5cf6' },
    { id: 'electronics', name: 'Electronics', icon: '💻', color: '#3b82f6' },
    { id: 'fashion', name: 'Fashion', icon: '👕', color: '#ec4899' },
    { id: 'home', name: 'Home & Living', icon: '🏠', color: '#10b981' },
    { id: 'books', name: 'Books', icon: '📚', color: '#f59e0b' },
    { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#8b5cf6' },
    { id: 'general', name: 'Other', icon: '🛍️', color: '#6b7280' },
  ];

  const loadWishlist = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [items, statistics] = await Promise.all([
        getWishlistItems(session.user.id),
        getWishlistStats(session.user.id)
      ]);
      setWishlist(items);
      setFilteredWishlist(items);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadWishlist();
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

  const handleDelete = async (itemId) => {
    if (!confirm('Remove this item?')) return;
    try {
      await deleteWishlistItem(itemId);
      await loadWishlist();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleAddToCart = async (item) => {
    if (!session?.user?.id) return alert('Please login');
    try {
      const priceVal = typeof item.price === 'string' 
        ? Number(item.price.replace(/[^\d]/g, '')) 
        : item.price;

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

  if (!session) return (
    <div className="wishlist-empty-state">
      <div className="wishlist-empty-card">
        <div className="wishlist-empty-icon">🔒</div>
        <h2>Login Required</h2>
        <p>Please login to view your wishlist</p>
      </div>
    </div>
  );

  return (
    <div className="wishlist-page">
      <div className="wishlist-hero-header">
        <div className="wishlist-profile-container">
          <div className="wishlist-profile-card">
            <div className="wishlist-profile-info">
              <h1 className="wishlist-title">My Wishlist</h1>
              <p className="wishlist-subtitle">
                {stats?.totalItems || 0} items • {stats?.totalValue ? `₹${stats.totalValue.toLocaleString()}` : '₹0'}
              </p>
            </div>
            <button className="wishlist-share-btn">
              <Share2 size={18} /> <span>Share List</span>
            </button>
          </div>
        </div>
      </div>

      <main className="wishlist-main-content">
        <div className="wishlist-section">
          <div className="wishlist-categories-scroller">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`wishlist-cat-card ${activeCategory === cat.id ? 'active' : ''}`}
                style={activeCategory === cat.id ? { '--cat-color': cat.color } : {}}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{wishlist.filter(i => cat.id === 'all' || i.category === cat.id).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wishlist-toolbar">
          <div className="wishlist-search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search your wishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="wishlist-actions-group">
            <div className="view-toggle">
              <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><Grid size={20}/></button>
              <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List size={20}/></button>
            </div>
            <AddWishlistItem session={session} onItemAdded={loadWishlist} categories={categories.filter(c => c.id !== 'all')} />
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'wishlist-grid' : 'wishlist-list-view'}>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : filteredWishlist.length > 0 ? (
            filteredWishlist.map(item => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onDelete={handleDelete} 
                onAddToCart={handleAddToCart} 
              />
            ))
          ) : (
            <div className="wishlist-empty-msg">No items found in this category.</div>
          )}
        </div>
      </main>
    </div>
  );
}