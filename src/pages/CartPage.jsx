import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './CartPage.css';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const showToast = useToast();
  
  const { currency, updateCurrency } = useCurrency();

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleCurrencyChange = async (newCode) => {
    try {
      await updateCurrency(newCode);
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  /**
   * 🚀 THE CORE FIX: 
   * This function normalizes the price. If the item was added in USD
   * but we are viewing in INR, it converts back. If they match, it stays.
   */
  const getNormalizedPrice = (item) => {
    const savedPrice = parseFloat(item.price) || 0;
    const savedCurrency = item.added_currency || 'INR'; // Fallback to INR if not set

    // 1. If saved currency matches current view, return exactly the saved price
    if (savedCurrency === currency.code) {
      return savedPrice;
    }

    // 2. If we are viewing INR but item was saved in something else (like USD)
    // Convert it BACK to INR using the rate it was saved with
    if (currency.code === 'INR') {
        const rateAtTimeOfAdding = item.added_rate || currency.rate || 1;
        return savedPrice / rateAtTimeOfAdding;
    }

    // 3. If we are viewing a different currency than what was saved
    // First get the "Pure INR" then multiply by current global rate
    const rateAtTimeOfAdding = item.added_rate || 1;
    const baseINR = savedCurrency === 'INR' ? savedPrice : (savedPrice / rateAtTimeOfAdding);
    return baseINR * (currency.rate || 1);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + getNormalizedPrice(item), 0);
  };

  const subtotal = calculateSubtotal();
  const platformFee = subtotal * 0.08; 
  const finalPayable = subtotal + platformFee;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat(currency.code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency.code || 'INR',
      maximumFractionDigits: currency.code === 'INR' ? 0 : 2
    }).format(amount || 0);
  };

  const isFormIncomplete = !senderName.trim() || !senderEmail.trim() || !senderEmail.includes('@');

  const handleCheckout = async () => {
    // For Razorpay (INR Base)
    // We get the subtotal in current view, convert to INR, then to Paise
    let amountInPaise;
    if (currency.code === 'INR') {
      amountInPaise = Math.round(finalPayable * 100);
    } else {
      amountInPaise = Math.round((finalPayable / currency.rate) * 100);
    }

    const options = {
      key: "rzp_test_RtgvVK9ZMU6pKm", 
      amount: amountInPaise, 
      currency: "INR", 
      display_currency: currency.code, 
      display_amount: finalPayable.toFixed(2), 
      name: "WishPeti",
      description: `Gifting ${cartItems.length} items`,
      handler: async function (response) {
        await handlePaymentSuccess(response);
      },
      prefill: { name: senderName, email: senderEmail },
      theme: { color: "#6366f1" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      const creatorId = cartItems[0]?.recipient_id || cartItems[0]?.creator_id; 
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
            razorpay_payment_id: response.razorpay_payment_id,
            buyer_name: senderName,
            buyer_email: senderEmail,
            creator_id: creatorId,
            total_amount: finalPayable, 
            items: cartItems, 
            payment_status: 'paid',
            gift_status: 'pending'
        }])
        .select();

      if (orderError) throw orderError;

      const itemIds = cartItems.map(item => item.id).filter(id => id && id !== 'undefined');
      if (itemIds.length > 0) {
          await supabase.from('wishlist_items').delete().in('id', itemIds);
      }

      localStorage.removeItem('wishlist_cart');
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
      navigate(`/success/${orderData?.[0]?.id}`);
    } catch (err) {
        showToast("Payment successful, but record update failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="cart-page-container">
      <div className="cart-content">
        <div className="cart-items-list">
          <div className="cart-header-row">
            <h1>Your Gift Cart ({cartItems.length})</h1>
            <select 
              className="currency-dropdown-minimal"
              value={currency.code}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {cartItems.map((item, index) => (
            <div key={index} className="cart-item-row">
              <img 
                src={item.image_url || item.image || 'https://placehold.co/150x150?text=Gift'} 
                alt={item.title} 
                className="cart-item-img" 
              />
              <div className="cart-item-info">
                <h4>{item.title}</h4>
                <p className="cart-item-recipient">For: <strong>{item.recipient_name || 'Verified Creator'}</strong></p>
                <span className="cart-item-price">{formatPrice(getNormalizedPrice(item))}</span>
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
          
          <div className="sender-form-container">
            <h4>Sender Details ✍️</h4>
            <input 
              type="text" 
              placeholder="Your Name" 
              className="form-input" 
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="form-input" 
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
          </div>

          <button 
            className="checkout-btn" 
            onClick={handleCheckout}
            disabled={isFormIncomplete || loading}
          >
            <CreditCard size={18} /> 
            {loading ? 'Processing...' : `Pay ${formatPrice(finalPayable)}`}
          </button>
        </div>
      </div>
    </div>
  );
}