import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useCurrency } from '../context/CurrencyContext';
import {convertAmount, fetchExchangeRate, getCurrencySymbol} from '../utils/currency';

export default function ContributeModal({ item, isOwner, onClose, onClaimGift, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Giver Information States
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Recent Givers States
  const [recentGivers, setRecentGivers] = useState([]);
  const [showGivers, setShowGivers] = useState(false);

  const { currency, updateCurrency } = useCurrency();
  // Safe Defaults for Currency to prevent "undefined"
  const symbol = getCurrencySymbol(currency.code);
  const rate = currency?.rate || 1;

  const displayGoal = (item.price * rate);
  const displayRaised = (item.amount_raised || 0) * rate;
  const displayRemaining = Math.max(displayGoal - displayRaised, 0);

  // Fetch recent givers for social proof
  useEffect(() => {
    const fetchGivers = async () => {
      const { data } = await supabase
        .from('orders')
        .select('buyer_name, total_amount, created_at')
        .eq('item_id', item.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setRecentGivers(data);
    };
    fetchGivers();
  }, [item.id]);

  const handlePayment = async () => {
    // 1. Convert input to a clean number
    let inputAmount = parseFloat(amount);

    if (!inputAmount || inputAmount <= 0 || !buyerEmail) {
      alert("Please enter a valid amount and email.");
      return;
    }

    // 2. AUTO-CAP & ROUNDING LOGIC
    // We use a small epsilon or simply round to 2 decimal places to avoid 51.4000000001
    if (inputAmount > displayRemaining) {
      // Round down to 2 decimal places to ensure we don't exceed the goal by a fraction
      inputAmount = Math.floor(displayRemaining * 100) / 100;
      setAmount(inputAmount.toString()); 
    }

    setLoading(true);

    try {
      // 3. Convert to INR for Razorpay
      const amountInINR = currency.code === 'INR' ? inputAmount : (inputAmount / rate);
      
      // Use Math.round here to ensure Paise is a whole integer (Razorpay requirement)
      const amountInPaise = Math.round(amountInINR * 100);

      const options = {
        key: "rzp_test_RtgvVK9ZMU6pKm", 
        amount: amountInPaise, 
        currency: "INR", 
        display_currency: currency.code,
        display_amount: inputAmount,
        name: "WishPeti",
        description: `Contribution for ${item.title}`,
        prefill: {
          name: isAnonymous ? "Anonymous" : buyerName,
          email: buyerEmail
        },
        handler: async function (response) {
          // Pass the clean inputAmount (e.g., 51.41) to the record
          await handleContributionRecord(response, inputAmount); 
          onSuccess(); 
        },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment error: " + err.message);
      setLoading(false);
    }
  };

  const handleContributionRecord = async (response, paidAmount) => {
    const amountInINR = currency.code !== 'INR' 
        ? Math.ceil(paidAmount / rate) 
        : Math.ceil(paidAmount);

    const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          razorpay_payment_id: response.razorpay_payment_id,
          item_id: item.id,
          creator_id: item.creator_id,
          total_amount: amountInINR,
          payment_status: 'paid',
          is_crowdfund: true,
          gift_status: 'pending',
          buyer_name: isAnonymous ? "Anonymous" : (buyerName || "Kind Supporter"),
          buyer_email: buyerEmail 
        }]);

    if (orderError) throw orderError;

    const { error: updateError } = await supabase.rpc('increment_wishlist_raised', {
        row_id: item.id,
        increment_by: amountInINR
    });

    if (updateError) {
        await supabase
        .from('wishlist_items')
        .update({ amount_raised: (item.amount_raised || 0) + amountInINR })
        .eq('id', item.id);
    }
    
    window.dispatchEvent(new Event('contributionUpdated'));
  };

  const isGoalReached = displayRemaining <= 0;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {isGoalReached ? 'Goal Reached! 🥳' : 'Contribute to Gift 🎁'}
          </h3>
          <X onClick={onClose} style={{ cursor: 'pointer', opacity: 0.5 }} />
        </div>

        <div style={{ padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
          <p style={itemText}>Item: <strong>{item.title}</strong></p>
          
          <div style={{
            ...remainingBox,
            backgroundColor: isGoalReached ? '#f0fdf4' : '#f8fafc',
            border: isGoalReached ? '1px solid #bbf7d0' : '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '12px', color: isGoalReached ? '#166534' : '#64748b' }}>
              {isGoalReached ? 'Status:' : 'Remaining Goal:'}
            </span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: isGoalReached ? '#15803d' : '#1e293b' }}>
              {isGoalReached ? 'Fully Funded' : `${symbol} ${displayRemaining.toLocaleString()}`}
            </div>
          </div>

          {!isGoalReached && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={fieldGroup}>
                <label style={labelStyle}>Your Email</label>
                <div style={inputContainer}>
                  <Mail size={16} style={iconStyle} />
                  <input 
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={inputStyleWithIcon}
                  />
                </div>
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Display Name</label>
                <div style={inputContainer}>
                  <User size={16} style={iconStyle} />
                  <input 
                    type="text"
                    value={isAnonymous ? '' : buyerName}
                    disabled={isAnonymous}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder={isAnonymous ? "Anonymous" : "Your name (optional)"}
                    style={{...inputStyleWithIcon, backgroundColor: isAnonymous ? '#f8fafc' : 'white'}}
                  />
                </div>
                
                {/* Fixed Checkbox Layout */}
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', cursor: 'pointer' }}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={() => {}} 
                    style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Keep my name anonymous on the wishlist</span>
                </div>
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Contribution Amount</label>
                <div style={inputContainer}>
                  <span style={prefixStyle}>{symbol}</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
                {/* Add this warning message */}
                {parseFloat(amount) > displayRemaining && (
                  <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600', marginTop: '4px' }}>
                    ✨ Amount will be capped at {symbol}{displayRemaining.toLocaleString()} to complete the goal.
                  </span>
                )}
              </div>

              <button 
                onClick={handlePayment}
                disabled={!amount || amount <= 0 || !buyerEmail || loading}
                style={{...btnStyle, opacity: (!amount || !buyerEmail || loading) ? 0.6 : 1}}
              >
                {loading ? 'Processing...' : `Confirm Contribution`}
              </button>
            </div>
          )}

          {/* Recent Givers Section */}
          {recentGivers.length > 0 && (
            <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', textAlign: 'left' }}>
               <button 
                 onClick={() => setShowGivers(!showGivers)} 
                 style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
               >
                 {showGivers ? 'Hide Recent Givers' : `View Recent Givers (${recentGivers.length})`}
               </button>
               {showGivers && (
                 <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {recentGivers.map((g, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{g.buyer_name}</span>
                       <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(g.created_at).toLocaleDateString()}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          <div style={footerStyle}>
            <ShieldCheck size={14} /> Secure Payment via Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' };
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' };
const modalStyle = { backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const headerStyle = { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const remainingBox = { padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '10px' };
const inputContainer = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconStyle = { position: 'absolute', left: '12px', color: '#94a3b8' };
const prefixStyle = { position: 'absolute', left: '14px', fontWeight: '700', color: '#475569' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' };
const inputStyleWithIcon = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const btnStyle = { width: '100%', padding: '16px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const itemText = { fontSize: '14px', margin: '0 0 16px 0', color: '#475569', textAlign: 'left' };
const footerStyle = { marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#94a3b8', fontSize: '11px' };