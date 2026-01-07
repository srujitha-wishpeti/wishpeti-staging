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
    let amountInPaise;
    const firstItem = cartItems[0];
    const creatorId = firstItem?.creator_id;

    if (currency.code === 'INR') {
      amountInPaise = Math.round(finalPayable * 100);
    } else {
      // Back to INR for Razorpay Gateway
      amountInPaise = Math.round((finalPayable / currency.rate) * 100);
    }

    await logSupportEvent('checkout_initiated', creatorId, { cart_total: finalPayable });
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
      config: {
        display: {
          hide_topbar: false,
          preferences: {
            show_default_blocks: true 
          }
        }
      },
      prefill: { name: senderName, email: senderEmail, contat: "+919972769491" }, //contact number default for better conversion rate
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: () => {
          showToast("Payment cancelled. Your cart is still saved!", "info");
          logSupportEvent('payment_modal_closed', creatorId, { reason: 'User cancelled' });
        }
      }

    };

    const rzp = new window.Razorpay(options);

    // ADD THIS LISTENER for specific payment failures (e.g. declined cards)
    rzp.on('payment.failed', function (response) {
      setLoading(false);
      showToast(`Payment failed: ${response.error.description}`, "error");
    });

    rzp.open();
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
        const { rate } = getCurrencyPreference();
        
        const displayName = isAnonymous ? 'Anonymous' : senderName;
        // 1. Map through cart items to create individual Order rows
        // This ensures every item triggers a separate Realtime Alert toast
        const orderPromises = cartItems.map(item => {
            const isSurprise = !!item.is_surprise;
            const itemPrice = parseFloat(item.price);
            
            // Convert individual item price to INR for the record
            const itemInINR = currency.code === 'INR' 
                ? itemPrice 
                : itemPrice / (currency.rate || 1);

            return supabase
                .from('orders')
                .insert([{
                    razorpay_payment_id: response.razorpay_payment_id,
                    buyer_name: senderName,
                    buyer_email: senderEmail,
                    buyer_message: giftMessage,
                    buyer_anonymous: isAnonymous,
                    creator_id: item.recipient_id || item.creator_id,
                    item_id: isSurprise? null : item.id, // Link to the specific item
                    total_amount: item.price, 
                    currency_code: item.is_surprise ? currency.code : 'INR',
                    payment_status: 'paid',
                    exchange_rate_at_payment: isSurprise? currency.rate : 1,
                    gift_status: 'pending',
                    is_surprise: isSurprise,
                    surprise_amount_in_inr: isSurprise ? itemInINR : 0
                }])
                .select();
        });

        // Execute all order inserts simultaneously
        const orderResults = await Promise.all(orderPromises);
        
        // Check for any insertion errors
        const firstError = orderResults.find(res => res.error);
        if (firstError) throw firstError.error;

        // Get the ID of the first order for the transaction record and redirect
        const firstOrderId = orderResults[0].data[0].id;
        let amountInInr;
        const amountInINR = currency.code === 'INR' 
                ? finalPayable 
                : finalPayable /
                 (currency.rate || 1);

        console.log(amountInInr);
        // 2. Log the Single Transaction (The "Money" record)
        // We only do this ONCE per payment, even if there are multiple items
        const { error: transError } = await supabase
          .from('transactions')
          .insert([{
              creator_id: cartItems[0]?.recipient_id || cartItems[0]?.creator_id,
              order_id: firstOrderId, 
              provider_payment_id: response.razorpay_payment_id,
              amount_inr: amountInInr, // The total amount paid in the cart
              currency_code: 'INR',
              type: 'gift_payment',
              status: 'success',
              currency_rate: currency.rate
          }]);

        if (transError) console.error("Transaction log failed:", transError.message);

        // 3. Decrement quantity only for physical items
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
        
        // Redirect to success page using the first order reference
        navigate(`/success/${firstOrderId}`);

    } catch (err) {
        console.error("Post-Payment Error:", err);
        showToast("Payment recorded, but we had trouble updating the wishlist.", "error");
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