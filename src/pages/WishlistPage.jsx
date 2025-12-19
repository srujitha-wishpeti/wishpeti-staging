// WishlistPage.jsx - Import the CSS file
// Add: import './WishlistPage.css' at the top

import React, { useEffect, useState } from 'react';
import { 
  Heart, Search, Grid, List, Trash2, ShoppingBag, Share2
} from 'lucide-react';
import AddWishlistItem from '../components/AddWishlistItem';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import { 
  getWishlistItems, 
  deleteWishlistItem, 
  updateItemVariants,
  getWishlistStats 
} from '../services/wishlist';
import './WishlistPage.css'; // Import the CSS
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';

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
      const items = await getWishlistItems(session.user.id);
      setWishlist(items);
      setFilteredWishlist(items);

      const statistics = await getWishlistStats(session.user.id);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadWishlist();
    }
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
    if (!confirm('Remove this item from your wishlist?')) return;

    try {
      await deleteWishlistItem(itemId);
      await loadWishlist();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleVariantChange = async (itemId, type, value) => {
    const item = wishlist.find(i => i.id === itemId);
    if (!item) return;

    const updatedVariants = {
      ...item.variants,
      [type === 'size' ? 'selectedSize' : 'selectedColor']: value
    };

    try {
      await updateItemVariants(itemId, updatedVariants);
      await loadWishlist();
    } catch (error) {
      console.error('Error updating variant:', error);
    }
  };

  const handleAddToCart = async (item) => {
    const userId = session?.user?.id;

    if (!userId) {
        alert('Please login to add items to cart');
        return;
    }

    try {
        const payload = {
        user_id: userId,
        product_id: item.id,
        quantity: 1,
        price: Number(String(item.price).replace(/[^\d]/g, '')),
        image_url: item.image_url || null,
        title: item.title,
        variants: item.variants || {}
        };

        console.log('ADD TO CART:', payload);

        await addToCart(payload);

        alert('Added to cart ✅');
    } catch (err) {
        console.error('ADD TO CART ERROR:', err);
        alert(err.message || 'Failed to add item');
    }
  };



  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return wishlist.length;
    return wishlist.filter(item => item.category === categoryId).length;
  };

  if (!session) {
    return (
      <div className="wishlist-empty" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div className="wishlist-empty-icon">🔒</div>
          <h2 className="wishlist-empty-title">Login Required</h2>
          <p className="wishlist-empty-text">Please login to view your wishlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Header */}
      <div className="wishlist-header">

        {/* Profile Section */}
        <div className="wishlist-profile-section">
          <div className="wishlist-profile-card">
            <div className="wishlist-profile-inner">
              <div className="wishlist-profile-header">
                <div>
                  <h1 className="wishlist-title">My Wishlist</h1>
                  <p className="wishlist-subtitle">
                    {stats?.totalItems || 0} items • 
                    {stats?.totalValue ? ` ₹${stats.totalValue.toLocaleString()}` : ' --'}
                  </p>
                </div>
                <button className="wishlist-share-btn">
                  <Share2 size={20} style={{ color: '#4b5563' }} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="wishlist-main">
        <div className="wishlist-container">
          {/* Categories */}
          <div className="wishlist-section">
            <div className="wishlist-categories">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`wishlist-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <div className="wishlist-category-icon">{cat.icon}</div>
                  <div className="wishlist-category-name">{cat.name}</div>
                  <div className="wishlist-category-count">{getCategoryCount(cat.id)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="wishlist-controls">
            <div className="wishlist-search-wrapper">
              <Search className="wishlist-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wishlist-search-input"
              />
            </div>

            <div className="wishlist-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`wishlist-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`wishlist-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              >
                <List size={20} />
              </button>
            </div>

            <AddWishlistItem 
              session={session} 
              onItemAdded={loadWishlist}
              categories={categories.filter(c => c.id !== 'all')}
            />
          </div>

          {/* Items */}
          <div>
            <div className="wishlist-items-header">
              <h3 className="wishlist-items-title">
                {activeCategory === 'all' 
                  ? 'All Wishes' 
                  : categories.find(c => c.id === activeCategory)?.name}
              </h3>
              <span className="wishlist-items-count">
                {filteredWishlist.length} {filteredWishlist.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {loading ? (
              <div className="wishlist-empty">
                <div className="wishlist-empty-icon" style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
                <p className="wishlist-empty-text">Loading your wishlist...</p>
              </div>
            ) : filteredWishlist.length === 0 ? (
              <div className="wishlist-empty">
                <div className="wishlist-empty-icon">📦</div>
                <h3 className="wishlist-empty-title">
                  {searchQuery ? 'No items found' : 'Your wishlist is empty'}
                </h3>
                <p className="wishlist-empty-text">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'Start adding items from your favorite stores!'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'wishlist-grid' : 'wishlist-list'}>
                {filteredWishlist.map((item) => (
                  <div key={item.id} className="wishlist-item-card">
                    <div className="wishlist-item-image">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="wishlist-item-img"
                          loading="lazy"
                        />
                      ) : (
                        <span className="wishlist-item-placeholder">🎁</span>
                      )}
                    
                      {item.discount && (
                        <div className="wishlist-item-discount">
                          {item.discount}
                        </div>
                      )}
                    </div>

                    <div className="wishlist-item-content">
                      <div className="wishlist-item-header">
                        <div className="wishlist-item-info">
                          {item.brand && (
                            <p className="wishlist-item-brand">{item.brand}</p>
                          )}
                          <h3 className="wishlist-item-title">{item.title}</h3>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="wishlist-item-delete"
                        >
                          <Trash2 size={16} style={{ color: '#9ca3af' }} />
                        </button>
                      </div>

                      {item.rating && (
                        <div className="wishlist-item-rating">
                          <span style={{ color: '#eab308' }}>⭐</span>
                          <span style={{ fontWeight: 600 }}>{item.rating}</span>
                          {item.reviews && (
                            <span style={{ color: '#9ca3af' }}>({item.reviews})</span>
                          )}
                        </div>
                      )}

                      <div className="wishlist-item-price">
                        <span className="wishlist-item-current-price">
                          {item.price || 'Price N/A'}
                        </span>
                        {item.original_price && (
                          <span className="wishlist-item-original-price">
                            {item.original_price}
                          </span>
                        )}
                      </div>

                      {item.variants && (
                        <div className="wishlist-item-variants">
                          {item.variants.colors && item.variants.colors.length > 0 && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <label className="wishlist-item-variant-label">Color:</label>
                              <select
                                value={item.variants.selectedColor || ''}
                                onChange={(e) => handleVariantChange(item.id, 'color', e.target.value)}
                                className="wishlist-item-variant-select"
                              >
                                {item.variants.colors.map(color => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {item.variants.sizes && item.variants.sizes.length > 0 && (
                            <div>
                              <label className="wishlist-item-variant-label">Size:</label>
                              <select
                                value={item.variants.selectedSize || ''}
                                onChange={(e) => handleVariantChange(item.id, 'size', e.target.value)}
                                className="wishlist-item-variant-select"
                              >
                                {item.variants.sizes.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="wishlist-item-footer">
                        <span>{item.store}</span>
                        <span className={`wishlist-item-availability ${
                          item.availability?.includes('Stock') ? 'in-stock' : 'out-of-stock'
                        }`}>
                          {item.availability || 'Check availability'}
                        </span>
                      </div>

                      <div className="wishlist-item-actions">
                        <button
                            className="wishlist-item-cart-btn"
                            onClick={() => handleAddToCart(item)}
                        >
                            <ShoppingBag size={14} />
                            Add to Cart
                        </button>

                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wishlist-item-buy-btn"
                        >
                            Buy
                        </a>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to enable spinning animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
