import { useEffect, useState } from 'react';
import { getCartItems, removeCartItem } from '../services/cart';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../services/supabaseClient'
import './CartPage.css';

export default function CartPage() {
  const { session, loading: authLoading } = useAuth(); // Added authLoading to wait for session check
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    const loggedInId = session?.user?.id;
    const guestId = localStorage.getItem('guest_cart_id');

    setLoading(true);
    try {
        // 🔑 This 'or' filter tells Supabase to find items from EITHER ID
        const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .or(`user_id.eq."${loggedInId}",user_id.eq."${guestId}"`);

        if (error) throw error;
        setItems(data || []);
    } catch (err) {
        console.error("Cart Fetch Error:", err);
    } finally {
        setLoading(false);
    }
  };

  // 2. Re-run when auth state changes (e.g., user logs in)
  useEffect(() => {
    if (!authLoading) {
      loadItems();
    }
  }, [session, authLoading]);

  const handleRemove = async (id) => {
    try {
      await removeCartItem(id);
      // Refresh the list after deleting
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  if (loading) return <div className="loader">Loading Cart...</div>;

  return (
    <div className="cart-page">
      <h1 className="cart-header">Your Cart</h1>

      {items.length === 0 ? (
        <div className="empty-cart">Your cart is empty.</div>
      ) : (
        <div className="cart-list">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={item.image_url} alt={item.title} />
              </div>
              <div className="cart-item-details">
                <h3>{item.title}</h3>
                <p className="cart-item-price">₹{item.price.toLocaleString()}</p>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary">
        <div className="summary-row">
          <span>Total Amount:</span>
          <span className="total-price">₹{total.toLocaleString()}</span>
        </div>
        <button className="checkout-btn" disabled>
          Checkout (coming soon)
        </button>
      </div>
    </div>
  );
}