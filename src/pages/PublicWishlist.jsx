import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWishlistItems } from '../services/wishlist';
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';

export default function PublicWishlist() {
  const { creatorId } = useParams(); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublicWishes = async () => {
      if (!creatorId) return;
      setLoading(true);
      try {
        const data = await getWishlistItems(creatorId);
        setItems(data || []);
      } catch (err) {
        console.error("Error loading public list:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPublicWishes();
  }, [creatorId]);

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
        recipient_id: creatorId 
      });
      alert("Added to your gift cart! 🎁");
    } catch (err) {
      console.error(err);
      alert("Failed to add gift to cart.");
    }
  };

  if (loading) return <div className="loading-state">Loading Creator's Wishes...</div>;

  return (
    <div className="wishlist-page">
      <div className="wishlist-hero-header" style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Support this Creator</h1>
      </div>
      
      <main className="wishlist-main-content" style={{ marginTop: '20px' }}>
        {items.length > 0 ? (
          <div className="wishlist-grid">
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No wishes found for this creator.</h3>
          </div>
        )}
      </main>
    </div>
  );
}