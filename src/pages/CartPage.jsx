import { useEffect, useState } from 'react';
import { getCartItems, removeCartItem } from '../services/cart';
import { useAuth } from '../auth/AuthProvider';

export default function CartPage() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    if (!session?.user?.id) return;
    try {
      const data = await getCartItems(session.user.id);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [session]);

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
    <div className="cart-page" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px' }}>Your Cart</h1>

      {items.length === 0 ? (
        <div className="empty-cart">Your cart is empty.</div>
      ) : (
        <div className="cart-list">
          {items.map(item => (
            <div key={item.id} className="cart-item" style={{ 
              display: 'flex', 
              gap: '20px', 
              background: 'white', 
              padding: '16px', 
              borderRadius: '12px',
              marginBottom: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <img src={item.image_url} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ color: '#4f46e5', fontWeight: '700', margin: '0' }}>₹{item.price.toLocaleString()}</p>
                <button 
                  onClick={() => handleRemove(item.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    padding: '0',
                    marginTop: '8px'
                  }}
                >
                  Remove Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary" style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Total Amount:</h2>
          <h2 style={{ margin: 0, color: '#111827' }}>₹{total.toLocaleString()}</h2>
        </div>
        <button 
          disabled 
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '8px', 
            background: '#e5e7eb', 
            border: 'none', 
            fontWeight: '700' 
          }}
        >
          Checkout (coming soon)
        </button>
      </div>
    </div>
  );
}