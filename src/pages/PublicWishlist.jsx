import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; 
import { getWishlistItems } from '../services/wishlist';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
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
  const location = useLocation();

  // Handle URL item highlighting/scrolling
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

  // Load Creator and Items
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

  /**
   * CONSOLIDATED ADD TO CART
   * 1. Prevents Duplicates
   * 2. Cleans price strings to prevent NaN
   * 3. Syncs recipient info correctly
   */
  const handleAddToCart = (item) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      
      // 1. Duplicate check
      const isDuplicate = existingCart.some(cartItem => cartItem.id === item.id);
      if (isDuplicate) {
        setToastMsg("Item is already in your gift cart!");
        setShowToast(true);
        return;
      }

      // 2. 🚀 FIX NaN: Numeric sanitizer
      let cleanPrice = item.price;
      if (typeof cleanPrice === 'string') {
        // Removes anything that isn't a digit or decimal point
        cleanPrice = parseFloat(cleanPrice.replace(/[^\d.]/g, ''));
      }
      
      // Fallback if the price is still invalid
      const finalPrice = isNaN(cleanPrice) ? 0 : cleanPrice;

      // 3. Construct clean object
      const itemToAdd = {
        ...item,
        price: finalPrice, 
        recipient_id: creator?.id || item.user_id, 
        recipient_name: creator?.display_name || 'Verified Creator',
        addedAt: new Date().getTime()
      };

      const updatedCart = [...existingCart, itemToAdd];
      localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));

      // 4. Update UI
      window.dispatchEvent(new Event('cartUpdated'));
      setToastMsg(`Added to your gift cart for ${creator?.display_name}! 🎁`);
      setShowToast(true);

    } catch (err) {
      console.error("Cart error:", err);
      setToastMsg("Failed to add gift to cart.");
      setShowToast(true);
    }
  };

  const joinedDate = creator?.created_at 
    ? new Date(creator.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Dec 2025';

  if (loading) return <div className="loading-state">Finding the wishlist...</div>;
  
  if (!creator) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Oops! Wishlist not found.</h2>
      <p>The username "@{username}" doesn't seem to exist.</p>
    </div>
  );

  return (
    <div className="wishlist-page">
      <div className="public-profile-header">
        <div className="profile-inner">
          <div className="profile-text">
            <h1>{creator.display_name}'s Wishlist</h1>
            <p>@{creator.username} • {items.length} items • Joined {joinedDate}</p>
          </div>
        </div>
      </div>

      <main className="wishlist-main-content">
        {items.length > 0 ? (
          <div className="public-wishlist-grid">
            {items.map(item => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={() => handleAddToCart(item)} // 🚀 Updated to use consolidated function
                isPublicView={true} 
                username={username}
              />
            ))}
          </div>
        ) : (
          <div className="empty-wishlist-state">
            <h3>No wishes found yet.</h3>
            <p>Check back soon to see what {creator.display_name} is wishing for!</p>
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