import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard, Lock, ShieldCheck, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './CartPage.css';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencyPreference, getCurrencySymbol } from '../utils/currency';
import {logSupportEvent} from '../utils/supportLogger';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const showToast = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false); // New state
  const { currency, updateCurrency, loading: currencyLoading, formatPrice } = useCurrency();

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    setCartItems(savedCart);
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };
  
  const isEmailValid = validateEmail(senderEmail);
  const isFormValid = senderName.trim().length > 0 && isEmailValid;

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

  const isFormIncomplete = !senderName.trim() || !senderEmail.trim() || !senderEmail.includes('@');

  const handleCheckout = async () => {
    // 1. Instant loading state
    setLoading(true);
    
    const firstItem = cartItems[0];
    const creatorId = firstItem?.creator_id;

    // 2. Calculate amounts synchronously
    let amountInPaise;
    if (currency.code === 'INR') {
      amountInPaise = Math.round(finalPayable * 100);
    } else {
      amountInPaise = Math.round((finalPayable / currency.rate) * 100);
    }

    // 3. FIRE AND FORGET: Don't 'await' the log. This keeps the execution thread 
    // "active" from the user click to the pop-up call.
    logSupportEvent('checkout_initiated', creatorId, { cart_total: finalPayable });

    const options = {
      key: "rzp_test_RtgvVK9ZMU6pKm", 
      amount: amountInPaise, 
      currency: "INR", 
      display_currency: currency.code, 
      display_amount: finalPayable.toFixed(2), 
      name: "WishPeti",
      description: `Gifting ${cartItems.length} items`,
      handler: async function (response) {
        // Handler stays async because it's triggered after payment
        await handlePaymentSuccess(response);
      },
      prefill: { name: senderName, email: senderEmail, contact: "+919972769491" },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: () => {
          setLoading(false); // Ensure loading is reset on close
          showToast("Payment cancelled. Your cart is still saved!", "info");
          logSupportEvent('payment_modal_closed', creatorId, { reason: 'User cancelled' });
        }
      }
    };

    // 4. Initialize and Open immediately
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      setLoading(false);
      showToast(`Payment failed: ${response.error.description}`, "error");
    });

    rzp.open();
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
        const creatorId = cartItems[0]?.recipient_id || cartItems[0]?.creator_id;
        
        // 1. Create the SINGLE Transaction record first
        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .insert([{
              creator_id: creatorId,
              provider_payment_id: response.razorpay_payment_id,
              amount_inr: currency.code === 'INR' ? finalPayable : Math.round(finalPayable / currency.rate),
              currency_code: 'INR',
              type: 'gift_payment',
              status: 'success',
              currency_rate: currency.rate
          }])
          .select()
          .single();

        if (transError) throw transError;
        const transactionId = transData.id;

        // 2. Create individual Order rows, all linked to that Transaction ID
        const orderPromises = cartItems.map(item => {
            const isSurprise = !!item.is_surprise;
            const itemPrice = parseFloat(item.price);
            const itemInINR = currency.code === 'INR' ? itemPrice : itemPrice / (currency.rate || 1);

            return supabase
                .from('orders')
                .insert([{
                    transaction_id: transactionId, // LINK TO THE TRANSACTION
                    razorpay_payment_id: response.razorpay_payment_id,
                    buyer_name: senderName,
                    buyer_email: senderEmail,
                    buyer_message: giftMessage,
                    buyer_anonymous: isAnonymous,
                    creator_id: item.recipient_id || item.creator_id,
                    item_id: isSurprise ? null : item.id,
                    total_amount: item.price, 
                    currency_code: item.is_surprise ? currency.code : 'INR',
                    payment_status: 'paid',
                    gift_status: 'pending',
                    is_surprise: isSurprise,
                    surprise_amount_in_inr: isSurprise ? itemInINR : 0
                }])
                .select();
        });

        const orderResults = await Promise.all(orderPromises);
        const firstOrderId = orderResults[0].data[0].id;

        // 3. Decrement quantities and Cleanup (Keep your existing code for this)
        // ... (rest of your existing cleanup/navigate code)
        navigate(`/success/${firstOrderId}`);

    } catch (err) {
        console.error("Post-Payment Error:", err);
        showToast("Error updating database.", "error");
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
                    <span className="price-tag">{getCurrencySymbol(currency.code)+getNormalizedPrice(item).toFixed(2)}</span>
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
                style={!isEmailValid && senderEmail ? { borderColor: '#ef4444' } : {}}
              />
              {!isEmailValid && senderEmail && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '-8px' }}>
                  Please enter a valid email address
                </span>
              )}
            </div>

            <textarea 
              placeholder="Write a message to your bestie... (Optional)" 
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              className="clean-checkout-inputs"
              style={{ minHeight: '80px', resize: 'vertical' }}
            />

            {/* ANONYMOUS TOGGLE */}
              <div className="anonymous-checkbox-container" onClick={() => setIsAnonymous(!isAnonymous)}>
                <div className={`custom-checkbox ${isAnonymous ? 'checked' : ''}`}>
                  {isAnonymous && <div className="checkbox-tick" />}
                </div>
                <span className="checkbox-label-text">Remain Anonymous to creator</span>
              </div>

              
            <div className="price-breakdown">
              <div className="price-row grand-total">
                <span>Gift Total</span>
                <span>{getCurrencySymbol(currency.code)+finalPayable.toFixed(2)}</span>
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
              {loading ? 'Processing...' : `Pay ${getCurrencySymbol(currency.code)+finalPayable.toFixed(2)}`}
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

const toggleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  margin: '4px 0 12px 0',
  cursor: 'pointer',
  padding: '4px'
};