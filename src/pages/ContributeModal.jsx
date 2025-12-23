import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, User, MessageSquare } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencySymbol } from '../utils/currency';

export default function ContributeModal({ item, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Giver Information
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [recentGivers, setRecentGivers] = useState([]);
  const [showGivers, setShowGivers] = useState(false);

  const { currency } = useCurrency();
  const symbol = getCurrencySymbol(currency.code);
  const rate = currency?.rate || 1;

  // --- LOGIC: UNIT PRICE * QUANTITY ---
  const unitPrice = item.price || 0;
  const quantity = item.quantity || 1;
  const totalGoalBase = unitPrice * quantity; // Base INR total goal
  
  const displayGoal = totalGoalBase * rate;
  const displayRaised = (item.amount_raised || 0) * rate;
  const displayRemaining = Math.max(displayGoal - displayRaised, 0);

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
    let inputAmount = parseFloat(amount);

    if (!inputAmount || inputAmount <= 0 || !buyerEmail) {
      alert("Please enter a valid amount and email.");
      return;
    }

    if (inputAmount > displayRemaining) {
      inputAmount = Math.floor(displayRemaining * 100) / 100;
      setAmount(inputAmount.toString()); 
    }

    setLoading(true);

    try {
      const amountInINR = currency.code === 'INR' ? inputAmount : (inputAmount / rate);
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
    const contributionInINR = currency.code !== 'INR' 
      ? parseFloat((paidAmount / rate).toFixed(2)) 
      : paidAmount;

    // 1. Create Order Record
    const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          razorpay_payment_id: response.razorpay_payment_id,
          item_id: item.id,
          creator_id: item.creator_id,
          total_amount: contributionInINR,
          payment_status: 'paid',
          is_crowdfund: true,
          gift_status: 'pending',
          buyer_name: isAnonymous ? "Anonymous" : (buyerName || "Kind Supporter"),
          buyer_email: buyerEmail,
          buyer_message: buyerMessage
        }]);

    if (orderError) throw orderError;

    // 2. Update Raised Amount
    const newRaisedTotal = (item.amount_raised || 0) + contributionInINR;
    const isNowFullyFunded = newRaisedTotal >= (totalGoalBase - 0.05); 
    
    const updatePayload = { amount_raised: newRaisedTotal };

    if (isNowFullyFunded) {
        updatePayload.status = 'claimed';
        updatePayload.quantity = 0; 
    }

    const { error: updateError } = await supabase
        .from('wishlist_items')
        .update(updatePayload)
        .eq('id', item.id);

    if (updateError) throw updateError;
    window.dispatchEvent(new Event('contributionUpdated'));
  };

  const isGoalReached = displayRemaining <= 0.01;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
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
            <div style={{ fontSize: '22px', fontWeight: '900', color: isGoalReached ? '#15803d' : '#1e293b' }}>
              {isGoalReached ? 'Fully Funded' : `${symbol}${displayRemaining.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
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
              </div>

              {/* Message Field */}
              <div style={fieldGroup}>
                <label style={labelStyle}>Message for Creator</label>
                <div style={inputContainer}>
                  <MessageSquare size={16} style={{...iconStyle, top: '12px'}} />
                  <textarea 
                    value={buyerMessage}
                    onChange={(e) => setBuyerMessage(e.target.value)}
                    placeholder="Leave a nice note..."
                    style={{...inputStyleWithIcon, height: '80px', resize: 'none', paddingTop: '10px'}}
                  />
                </div>
              </div>

              {/* Anonymous Toggle Card (Crowdfund Style) */}
              <div 
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  ...toggleCardStyle,
                  borderColor: isAnonymous ? '#6366f1' : '#e2e8f0',
                  backgroundColor: isAnonymous ? '#f5f3ff' : '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={() => {}} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
                    Stay Anonymous 👤
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Hide your identity and message from the public wishlist.
                  </div>
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
                {parseFloat(amount) > displayRemaining && (
                  <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600' }}>
                    ✨ Capped at {symbol}{displayRemaining.toFixed(2)} to complete the goal.
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
const modalStyle = { backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const headerStyle = { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const remainingBox = { padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '10px' };
const inputContainer = { position: 'relative', display: 'flex', alignItems: 'flex-start' };
const iconStyle = { position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' };
const prefixStyle = { position: 'absolute', left: '16px', top: '16px', fontWeight: '700', color: '#1e293b' };
const inputStyle = { width: '100%', padding: '14px 12px 14px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' };
const inputStyleWithIcon = { width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const btnStyle = { width: '100%', padding: '16px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' };
const itemText = { fontSize: '14px', margin: '0 0 16px 0', color: '#475569', textAlign: 'left' };
const footerStyle = { marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#94a3b8', fontSize: '11px' };

const toggleCardStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '14px',
  borderRadius: '14px',
  border: '2px solid',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left'
};