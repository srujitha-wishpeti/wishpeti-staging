import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; 
import { getWishlistItems } from '../services/wishlist';
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import './WishlistPage.css'; 
import './PublicWishlist.css'; 
import Toast from '../components/ui/Toast';

export default function PublicWishlist() {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const { username } = useParams(); 
  const [items, setItems] = useState([]);
  const [creator, setCreator] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  
  useEffect(() => {
    const loadPublicWishes = async () => {
      if (!username) return;
      setLoading(true);
      
      try {
        // 1. Fetch creator profile using the username from the URL
        const { data: profile, error: profileError } = await supabase
          .from('creator_profiles')
          .select('id, display_name, username, created_at')
          .eq('username', username.toLowerCase())
          .single();

        if (profileError || !profile) {
          console.error("Creator not found");
          setLoading(false);
          return;
        }

        setCreator(profile);

        // 2. Fetch wishlist items using the ID we just found
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

  // --- LOGIC FOR JOINED DATE ---
  // We put this here so it's accessible to the return statement
  const joinedDate = creator?.created_at 
    ? new Date(creator.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Dec 2025';
  // --- Inside your Wishlist or Product component ---
  const handleAddToCart = (item, creatorName) => {
    const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    
    const newItem = {
        ...item,
        // 🚀 This is the key fix:
        recipient_name: creatorName || 'Verified Creator', 
        addedAt: new Date().getTime()
    };

    const updatedCart = [...existingCart, newItem];
    localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));
    
    // Trigger event so the Navbar/Cart updates immediately
    window.dispatchEvent(new Event('cartUpdated'));
  };
  const displayRecipient = (item) => {
    if (item.recipient_name) return item.recipient_name;
    
    // Try to find it in the URL if it's a shared wishlist link
    const urlParams = new URLSearchParams(window.location.search);
    const nameFromUrl = urlParams.get('creator');
    
    return nameFromUrl || "Verified Creator"; 
  };
  const handleFanAddToCart = async (item) => {
    try {
      let guestId = localStorage.getItem('guest_cart_id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guest_cart_id', guestId);
      }
      
      // Update local storage cart directly for the Navbar to see
      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      const updatedCart = [...existingCart, item];
      localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));

      const addToCart = (product, creatorName) => {
        const cart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
        
        const itemToAdd = {
            ...product,
            recipient_name: creatorName, // 🚀 Make sure this variable is passed here!
        };
        
        cart.push(itemToAdd);
        localStorage.setItem('wishlist_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
      };

      // 🔥 Trigger the Navbar update
      window.dispatchEvent(new Event('cartUpdated'));
      
      setToastMsg(`Added to your gift cart for ${creator.display_name}! 🎁`);
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to add gift to cart.");
      setShowToast(true);
    }
  };

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
          {/* Added the initials avatar back with styling */}
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
                onAddToCart={handleFanAddToCart}
                isPublicView={true} 
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '16px' }}>
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