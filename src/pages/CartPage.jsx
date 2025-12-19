import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CartPage.css';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  // 1. Load cart from LocalStorage
  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    loadCart();
  }, []);

  // 2. Remove Item & Update Navbar
  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    
    // 🔥 This updates the Navbar count immediately
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // 3. Calculate Total
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };

  // 4. Format Price Helper
  const formatPrice = (amount) => {
    const currency = cartItems[0]?.currency || 'INR';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state">
        <ShoppingCart size={64} color="#cbd5e1" />
        <h2>Your gift cart is empty</h2>
        <p>Go back to a creator's wishlist to add some magic! ✨</p>
        <Link to="/" className="back-btn"><ArrowLeft size={18}/> Explore Wishlists</Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-content">
        <div className="cart-items-list">
          <h1>Your Gift Cart ({cartItems.length})</h1>
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item-row">
              <img src={item.image_url || item.image} alt={item.title} className="cart-item-img" />
              <div className="cart-item-info">
                <h4>{item.title}</h4>
                <p className="cart-item-recipient">For: {item.recipient_name || 'The Creator'}</p>
                <span className="cart-item-price">{formatPrice(item.price)}</span>
              </div>
              <button onClick={() => removeItem(index)} className="cart-remove-btn">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items Total</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <div className="summary-row">
            <span>Service Fee</span>
            <span>{formatPrice(0)}</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total Payable</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <button className="checkout-btn" onClick={() => alert('Proceeding to Razorpay...')}>
            <CreditCard size={18} /> Checkout Now
          </button>
          <p className="secure-text">🔒 Secure checkout via Razorpay</p>
        </div>
      </div>
    </div>
  );
}