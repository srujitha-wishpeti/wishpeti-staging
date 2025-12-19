import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // 🔑 Needed to look up username
import { getWishlistItems } from '../services/wishlist';
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import './WishlistPage.css'; // 🔑 Use the same CSS for layout consistency

export default function PublicWishlist() {
  const { username } = useParams(); // 🔑 Changed from creatorId to username
  const [items, setItems] = useState([]);
  const [creator, setCreator] = useState(null); // 🔑 Store creator profile info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublicWishes = async () => {
      if (!username) return;
      setLoading(true);
      
      try {
        // 1. Fetch creator profile using the username from the URL
        const { data: profile, error: profileError } = await supabase
          .from('creator_profiles')
          .select('id, display_name, username')
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

  const handleFanAddToCart = async (item) => {
    try {
      // Use a guest ID stored in localStorage to track the fan's cart
      let guestId = localStorage.getItem('guest_cart_id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guest_cart_id', guestId);
      }
      
      await addToCart(guestId, {
        ...item,
        recipient_id: creator.id // 🔑 Use the ID from the fetched creator profile
      });
      alert(`Added to your gift cart for ${creator.display_name}! 🎁`);
    } catch (err) {
      console.error(err);
      alert("Failed to add gift to cart.");
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
      {/* 🔑 Re-using your Hero Header layout for consistency */}
      <div className="wishlist-hero-header">
        <div className="wishlist-profile-container">
          <div className="wishlist-profile-card">
            <div className="wishlist-profile-info">
              <h1 className="wishlist-title">{creator.display_name}'s Wishlist</h1>
              <p className="wishlist-subtitle">Choose a gift to send to @{creator.username}</p>
            </div>
            {/* Optional: Add a 'Follow' or 'Share' button here for fans */}
          </div>
        </div>
      </div>
      
      <main className="wishlist-main-content">
        {items.length > 0 ? (
          <div className="wishlist-grid">
            {items.map(item => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={handleFanAddToCart}
                isPublicView={true} // 🔑 This should hide 'Delete' buttons in your card component
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
    </div>
  );
}