import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './CartPage.css';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencyPreference } from '../utils/currency';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const showToast = useToast();
  
  const { currency, updateCurrency, loading: currencyLoading } = useCurrency();

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    setCartItems(savedCart);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const validateCartItems = async () => {
    // FIX 1: Filter out surprise items. Only query real DB IDs.
    const realItemIds = cartItems
      .filter(item => !item.is_surprise && item.id)
      .map(item => item.id);
      
    if (realItemIds.length === 0) return;

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id, quantity, status, title')
      .in('id', realItemIds);

    if (error) return;

    const unavailableItems = data.filter(dbItem => dbItem.quantity <= 0 || dbItem.status === 'claimed');

    if (unavailableItems.length > 0) {
      const names = unavailableItems.map(i => i.title).join(', ');
      showToast(`Oops! ${names} was just gifted by someone else.`);
      
      const filteredCart = cartItems.filter(cartItem => 
        !unavailableItems.find(un => un.id === cartItem.id)
      );
      setCartItems(filteredCart);
      localStorage.setItem('wishlist_cart', JSON.stringify(filteredCart));
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      validateCartItems();
    }
  }, [cartItems.length]);

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

  const getNormalizedPrice = (item) => {
    const savedPrice = parseFloat(item.price) || 0;
    const savedCurrency = item.added_currency || 'INR';
    
    if (item.is_surprise) {
      return item.price;
    }
    // FIX 2: THE GOLDEN RULE
    // If viewing currency matches how it was added (USD -> USD), skip math.
    if (savedCurrency === currency.code) {
      return savedPrice;
    }

    // Convert back to base INR first
    if (currency.code === 'INR') {
        const rateAtTimeOfAdding = item.added_rate || currency.rate || 1;
        return savedPrice / rateAtTimeOfAdding;
    }

    // Convert to foreign currency via base INR
    const rateAtTimeOfAdding = item.added_rate || 1;
    const baseINR = savedCurrency === 'INR' ? savedPrice : (savedPrice / rateAtTimeOfAdding);
    return baseINR * (currency.rate || 1);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + getNormalizedPrice(item), 0);
  };

  const finalPayable = calculateTotal();

  const formatPrice = (amount) => {
    if (currencyLoading) return "...";
    return new Intl.NumberFormat(currency.code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency.code || 'INR',
      maximumFractionDigits: currency.code === 'INR' ? 0 : 2
    }).format(amount || 0);
  };

  const isFormIncomplete = !senderName.trim() || !senderEmail.trim() || !senderEmail.includes('@');

  const handleCheckout = async () => {
    let amountInPaise;
    if (currency.code === 'INR') {
      amountInPaise = Math.round(finalPayable * 100);
    } else {
      // Back to INR for Razorpay Gateway
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
        const { rate } = getCurrencyPreference();
        
        // 1. Calculate Surprise Amount (Funds)
        const surpriseTotal = cartItems
            .filter(item => item.is_surprise)
            .reduce((sum, item) => sum + parseFloat(item.price), 0);
        
        // Convert to INR for the record (Net balance calculation happens on 'Accept')
        const surpriseInINR = currency.code === 'INR' 
            ? surpriseTotal 
            : surpriseTotal / (currency.rate || 1);

        // 2. Insert the Order Record (Now with is_surprise flag)
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                razorpay_payment_id: response.razorpay_payment_id,
                buyer_name: senderName,
                buyer_email: senderEmail,
                creator_id: creatorId,
                subtotal: finalPayable, 
                total_amount: finalPayable, 
                currency_code: currency.code,
                items: cartItems, 
                payment_status: 'paid',
                exchange_rate_at_payment: rate,
                gift_status: 'pending',
                is_surprise: surpriseTotal > 0, // Critical flag for Manage Gifts page
                surprise_amount_in_inr: surpriseInINR
            }])
            .select();

        if (orderError) throw orderError;

        // 3. Log the Transaction (Using your specific table schema)
        const { error: transError } = await supabase
          .from('transactions')
          .insert([{
              creator_id: cartItems?.[0]?.creator_id,
              order_id: orderData?.[0]?.id,
              provider_payment_id: response.razorpay_payment_id, // Renamed
              amount_inr: finalPayable,
              currency: currency.code, // Renamed from currency_from
              type: 'gift_payment', // Added to match transactions_type_check constraint
              status: 'success',
              currency_rate: currency.rate
          }]);

        if (transError) console.error("Transaction log failed:", transError.message);

        // 3. Decrement quantity only for physical items
        // (Surprise gifts don't have inventory to decrement)
        const physicalItems = cartItems.filter(item => !item.is_surprise);
        
        if (physicalItems.length > 0) {
            const dbUpdatePromises = physicalItems.map(item => 
                supabase.rpc('decrement_item_quantity', { row_id: item.id })
            );
            await Promise.all(dbUpdatePromises);
        }

        // 4. Cleanup and Navigate
        localStorage.removeItem('wishlist_cart');
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Redirect to success page
        navigate(`/success/${orderData?.[0]?.id}`);

    } catch (err) {
        console.error("Post-Payment Error:", err);
        showToast("Payment recorded, but we had trouble updating the wishlist. Don't worry, your gift is safe!");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-main-container">
        
        <div className="cart-items-column">
          <div className="cart-header-section">
            <Link to="/" className="back-to-wishlist">
              <ArrowLeft size={16} /> Back to Wishlist
            </Link>
            <div className="header-title-row">
              <h1>Gift Cart ({cartItems.length})</h1>
              <select 
                className="currency-picker"
                value={currency.code}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingCart size={48} color="#cbd5e1" />
              <p>Your cart is empty. Pick a gift to get started!</p>
            </div>
          ) : (
            <div className="cart-items-grid">
              {cartItems.map((item, index) => (
                <div key={index} className="modern-cart-item">
                  <img 
                    src={item.image_url || item.image || 'https://placehold.co/150x150?text=Gift'} 
                    alt={item.title} 
                  />
                  <div className="item-details">
                    <h4>{item.title}</h4>
                    <p>Recipient: <span>{item.recipient_name || 'Creator'}</span></p>
                    <span className="price-tag">{formatPrice(getNormalizedPrice(item))}</span>
                  </div>
                  <button onClick={() => removeItem(index)} className="item-remove-icon">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-summary-column">
          <div className="modern-summary-card">
            <h3>Secure Checkout</h3>
            
            <div className="sender-inputs">
              <label>Sender Information</label>
              <input 
                type="text" 
                placeholder="Your Name (Visible to creator)" 
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
              <input 
                type="email" 
                placeholder="Email Address (For receipt)" 
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>

            <div className="price-breakdown">
              <div className="price-row grand-total">
                <span>Gift Total</span>
                <span>{formatPrice(finalPayable)}</span>
              </div>
              <div className="price-row shipping">
                <span>Shipping & Delivery</span>
                <span className="free-tag">INCLUDED</span>
              </div>
              <div className="price-row shipping">
                <span>Privacy Handling</span>
                <span className="free-tag">SECURE</span>
              </div>
            </div>

            <button 
              className="pay-now-button" 
              onClick={handleCheckout}
              disabled={isFormIncomplete || loading || cartItems.length === 0}
            >
              <CreditCard size={18} /> 
              {loading ? 'Processing...' : `Pay ${formatPrice(finalPayable)}`}
            </button>

            <div className="security-badges">
              <span><Lock size={12} /> SSL Secured</span>
              <span><ShieldCheck size={12} /> Razorpay Verified</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}