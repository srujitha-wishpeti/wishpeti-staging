import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './CartPage.css';
import { useToast } from '../context/ToastContext';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const showToast = useToast();

  const loadCart = () => {
    // 💡 Added console log to help you debug what's inside localStorage
    const savedCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    console.log("Cart loaded from storage:", savedCart);
    setCartItems(savedCart);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    localStorage.setItem('wishlist_cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const cleanPrice = typeof item.price === 'string' 
        ? item.price.replace(/[^\d.]/g, '') 
        : item.price;
      return sum + (parseFloat(cleanPrice) || 0);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const platformFee = subtotal * 0.08; 
  const finalPayable = subtotal + platformFee;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const isFormIncomplete = !senderName.trim() || !senderEmail.trim() || !senderEmail.includes('@');

  const handleCheckout = async () => {
    if (isFormIncomplete) return;
    setLoading(true);

    const options = {
      key: "rzp_test_RtgvVK9ZMU6pKm", 
      amount: Math.round(finalPayable * 100),
      currency: "INR",
      name: "WishPeti",
      description: `Gifting ${cartItems.length} items`,
      handler: async function (response) {
        await handlePaymentSuccess(response);
      },
      prefill: {
        name: senderName,
        email: senderEmail,
      },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: function() { setLoading(false); }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK failed to load.");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
        // 1. Determine Creator ID
        const creatorId = cartItems[0]?.recipient_id || cartItems[0]?.user_id || cartItems[0]?.creator_id; 

        if (!creatorId) {
            console.error("Critical Error: No Creator ID found in cart items!");
        }

        // 2. Insert into Orders
        const { error: orderError } = await supabase
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
            }]);

        if (orderError) throw orderError;

        // 3. 🚀 FIXED: Robust Item Deletion logic
        // We log itemIds to the console so you can debug the UUIDs
        const itemIds = cartItems
            .map(item => item.id) 
            .filter(id => id && id !== 'undefined' && id !== null);

        console.log("Attempting to delete these wishlist IDs:", itemIds);

        if (itemIds.length > 0) {
            // Note: If this still fails, it is 100% a Supabase RLS Policy issue.
            const { error: deleteError } = await supabase
                .from('wishlist_items')
                .delete()
                .in('id', itemIds);

            if (deleteError) {
                console.error("Wishlist cleanup failed:", deleteError.message);
                // Tip: If error message is 'policy violation', see the SQL fix below.
            } else {
                console.log("Wishlist items successfully removed.");
            }
        }

        // 4. Cleanup & Redirect
        localStorage.removeItem('wishlist_cart');
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Inside handlePaymentSuccess in CartPage.jsx after order is created
        const orderId = orderData?.[0]?.id; // Get the ID of the order you just inserted

        showToast(`Payment Successful! You can track your gift status here: \n${window.location.origin}/track/${orderId}`);
        navigate('/dashboard'); 
        
    } catch (err) {
        console.error("Post-Payment Error:", err.message);
        showToast("Payment successful, but we had trouble updating the record: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state">
        <ShoppingCart size={64} color="#cbd5e1" />
        <h2>Your gift cart is empty</h2>
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
              {/* Added a fallback for broken images to prevent net::ERR_FAILED console noise */}
              <img 
                src={item.image_url || 'https://placehold.co/150x150?text=Gift'} 
                alt={item.title} 
                className="cart-item-img" 
                onError={(e) => { 
                    e.target.onerror = null; // Prevent infinite loops
                    e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150&h=150&fit=crop'; 
                }}
              />
              <div className="cart-item-info">
                <h4>{item.title}</h4>
                <p className="cart-item-recipient">For: <strong>{item.recipient_name || 'Verified Creator'}</strong></p>
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
          
          <div style={styles.formContainer}>
            <h4 style={{marginBottom: '10px', fontSize: '16px'}}>Sender Details ✍️</h4>
            <input 
              type="text" 
              placeholder="Your Name" 
              style={styles.inputStyle} 
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              style={styles.inputStyle} 
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
            <div style={styles.privacyNote}>🔒 Private & Secure Checkout</div>
          </div>

          <button 
            className="checkout-btn" 
            onClick={handleCheckout}
            disabled={isFormIncomplete || loading}
            style={{ 
                opacity: (isFormIncomplete || loading) ? 0.6 : 1,
                cursor: (isFormIncomplete || loading) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '15px', backgroundColor: '#1e293b', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '16px'
            }}
          >
            <CreditCard size={18} /> 
            {loading ? 'Processing...' : `Pay ${formatPrice(finalPayable)}`}
          </button>
        </div>
      </div>
      
      <footer className="cart-footer" style={{marginTop: '40px', textAlign: 'center', padding: '20px', borderTop: '1px solid #e2e8f0'}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px', fontSize: '13px'}}>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/refund">Refunds</Link>
            <Link to="/contact">Contact Us</Link>
        </div>
        <p style={{fontSize: '12px', color: '#94a3b8'}}>© 2025 WishPeti - Bellary, Karnataka</p>
      </footer>
    </div>
  );
}

const styles = {
  formContainer: {
    marginTop: '20px',
    padding: '15px',
    background: '#f1f5f9',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px'
  },
  inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#ffffff', // Explicit white
    color: '#111827',           // Explicit dark grey/black
    WebkitTextFillColor: '#111827', // The "Magic" iOS fix
    fontSize: '16px',           // Professional standard to avoid zoom
    appearance: 'none',         // Removes default iOS inner shadows
  },
  privacyNote: {
    fontSize: '11px',
    color: '#64748b',
    textAlign: 'center'
  }
};