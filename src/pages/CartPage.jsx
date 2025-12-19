import { useEffect, useState } from 'react';
import { getCartItems, removeCartItem } from '../services/cart';
import { useAuth } from '../auth/AuthProvider';

export default function CartPage() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!session) return;
    getCartItems(session.user.id).then(setItems);
  }, [session]);

  const total = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0),
    0
  );

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.image_url} />
          <div>
            <h3>{item.title}</h3>
            <p>{item.price}</p>
            <button onClick={() => removeCartItem(item.id)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="cart-summary">
        <h2>Total: ₹{total}</h2>
        <button disabled>
          Checkout (coming soon)
        </button>
      </div>
    </div>
  );
}
