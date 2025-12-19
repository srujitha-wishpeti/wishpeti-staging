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
    window.dispatchEvent(new Event('cartUpdated'));
  };

    // 3. Calculation Logic (FIXED)
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      // Remove everything except digits and dots
      const cleanPrice = typeof item.price === 'string' 
        ? item.price.replace(/[^\d.]/g, '') 
        : item.price;
      
      const numericPrice = parseFloat(cleanPrice) || 0;
      return sum + numericPrice;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const platformFee = subtotal * 0.08; // 8% Fee
  const finalPayable = subtotal + platformFee;

  

  // 4. Formatting Helper
  const formatPrice = (amount) => {
    const currency = cartItems[0]?.currency || 'INR';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 5. Razorpay Logic
  const handleCheckout = async () => {
    const currency = cartItems[0]?.currency || 'INR';
    
    // 🔥 Use finalPayable and convert to smallest unit (Paise/Cents)
    const amountInSmallestUnit = Math.round(finalPayable * 100);

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // 🔑 Replace with your actual Key ID
      amount: amountInSmallestUnit,
      currency: currency,
      name: "WishGifts",
      description: `Gifting ${cartItems.length} items`,
      image: "https://yourwebsite.com/logo.png", 
      handler: function (response) {
        handlePaymentSuccess(response);
      },
      prefill: {
        name: "Fan",
        email: "fan@example.com",
      },
      theme: {
        color: "#6366f1",
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
    }
  };

  const handlePaymentSuccess = (response) => {
    console.log("Payment Success ID:", response.razorpay_payment_id);
    localStorage.removeItem('wishlist_cart');
    setCartItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
    alert("Payment Successful! Your gifts are on the way. 🎁");
  };

  // Empty State
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
                <p className="cart-item-recipient">For: {item.recipient_name || 'Creator'}</p>
                <span className="cart-item-price">{formatPrice(item.price)}</span>
              </div>
              <button onClick={() => removeItem(index)} className="cart-remove-btn">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* --- Summary Sidebar --- */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>
          
          <div className="summary-row">
            <span>Items Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="summary-row">
            <span>Platform Fee (8%)</span>
            <span>{formatPrice(platformFee)}</span>
          </div>
          
          <hr className="summary-divider" />
          
          <div className="summary-row total">
            <span>Total Payable</span>
            <span>{formatPrice(finalPayable)}</span>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            <CreditCard size={18} /> Pay {formatPrice(finalPayable)}
          </button>
          
          <p className="secure-text">🔒 Secure checkout via Razorpay</p>
        </div>
      </div>
      <footer className="cart-footer">
        <div className="policy-links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/refunds">Refund Policy</a>
        </div>
        <p>© 2025 WishGifts - All payments secured by Razorpay</p>
      </footer>
    </div>
  );
}