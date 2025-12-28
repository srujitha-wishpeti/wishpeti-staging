import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, User, MessageSquare, Heart, TrendingUp, Download } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencySymbol } from '../utils/currency';
import {logSupportEvent} from '../utils/supportLogger';

export default function ContributeModal({ item, onClose, onSuccess, isOwner }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Giver Information
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [recentGivers, setRecentGivers] = useState([]);
  const [showGivers, setShowGivers] = useState(isOwner);

  const { currency } = useCurrency();
  const symbol = getCurrencySymbol(currency.code);
  const rate = currency?.rate || 1;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail);
  

  // --- LOGIC: UNIT PRICE * QUANTITY ---
  const unitPrice = item.price || 0;
  const quantity = item.quantity || 1;
  const totalGoalBase = unitPrice * quantity; // Base INR total goal
  
  const displayGoal = totalGoalBase * rate;
  const displayRaised = (item.amount_raised || 0) * rate;
  const displayRemaining = Math.max(displayGoal - displayRaised, 0);
  const progressPercent = Math.min((displayRaised / displayGoal) * 100, 100);

  const PRESETS = {
    INR: [500, 1000, 2000, 5000],
    USD: [10, 25, 50, 100],
    EUR: [10, 20, 50, 100],
    GBP: [10, 20, 50, 100]
  };

  useEffect(() => {
    const fetchGivers = async () => {
      const { data } = await supabase
        .from('orders')
        .select('buyer_name, buyer_email, total_amount, created_at, buyer_message')
        .eq('item_id', item.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });
      if (data) setRecentGivers(data);
    };
    fetchGivers();
  }, [item.id]);

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (recentGivers.length === 0) return;
    const headers = ["Donor Name", "Amount", "Date", "Email", "Message"];
    const rows = recentGivers.map(g => [
      `"${g.buyer_name}"`,
      `"${symbol}${(g.total_amount * rate).toFixed(2)}"`,
      `"${new Date(g.created_at).toLocaleDateString()}"`,
      `"${g.buyer_email || 'N/A'}"`,
      `"${(g.buyer_message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contributions_${item.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      rzp.on('payment.failed', function (response) {
        setLoading(false);
        alert("Payment failed: " + response.error.description);
      });

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

    logSupportEvent('contribution_to_crowdfund', item.creator_id, { amount: contributionInINR });
    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          razorpay_payment_id: response.razorpay_payment_id,
          item_id: item.id,
          creator_id: item.creator_id,
          total_amount: contributionInINR,
          exchange_rate_at_payment:currency.rate,
          payment_status: 'paid',
          is_crowdfund: true,
          gift_status: 'pending',
          buyer_name: isAnonymous ? "Anonymous" : (buyerName || "Kind Supporter"),
          buyer_email: buyerEmail,
          buyer_message: buyerMessage
        }])
        .select() // <--- CRITICAL: This allows you to get the ID
        .single();

    if (orderError) throw orderError;

    // 3. LOG THE TRANSACTION (Matching your existing table)
    const { error: transError } = await supabase
    .from('transactions')
    .insert([{
        creator_id: item.creator_id,
        order_id: newOrder.id,
        provider_payment_id: response.razorpay_payment_id, // Renamed
        amount_inr: contributionInINR,
        currency_code: currency.code, // Renamed from currency_from
        type: 'gift_payment', // Added to match transactions_type_check constraint
        status: 'success',
        currency_rate: currency.rate
    }]);

    if (transError) console.error("Transaction log failed:", transError.message);

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
            {isOwner ? 'Gift Management' : (isGoalReached ? 'Goal Reached! 🥳' : 'Contribute to Gift 🎁')}
          </h3>
          <X onClick={onClose} style={{ cursor: 'pointer', opacity: 0.5 }} />
        </div>

        <div style={{ padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
          <p style={itemText}>Item: <strong>{item.title}</strong></p>
          
          {/* Progress Bar Section */}
          <div style={{...remainingBox, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={labelStyle}>Raised: {symbol}{displayRaised.toFixed(2)}</span>
                <span style={labelStyle}>Goal: {symbol}{displayGoal.toFixed(2)}</span>
            </div>
            <div style={progressBarContainer}>
                <div style={{...progressBarFill, width: `${progressPercent}%`}}></div>
            </div>
          </div>

          {isOwner ? (
            /* --- OWNER VIEW: Dashboard & History --- */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={ownerStatsGrid}>
                    <div style={statCard}>
                        <TrendingUp size={16} color="#6366f1" />
                        <span style={{fontSize: '11px', color: '#64748b'}}>Remaining</span>
                        <div style={{fontWeight: '700'}}>{symbol}{displayRemaining.toFixed(2)}</div>
                    </div>
                    <div style={statCard}>
                        <Heart size={16} color="#ec4899" />
                        <span style={{fontSize: '11px', color: '#64748b'}}>Supporters</span>
                        <div style={{fontWeight: '700'}}>{recentGivers.length}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>Contribution History</label>
                    {recentGivers.length > 0 && (
                      <button onClick={handleExportCSV} style={exportBtnStyle}>
                        <Download size={12} /> CSV
                      </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentGivers.length > 0 ? recentGivers.map((g, i) => (
                        <div key={i} style={ownerGiverRow}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{g.buyer_name}</div>
                                {g.buyer_message && <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>"{g.buyer_message}"</div>}
                            </div>
                            <div style={{ fontWeight: '700', color: '#10b981' }}>+{symbol}{(g.total_amount * rate).toFixed(2)}</div>
                        </div>
                    )) : (
                        <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No contributions yet.</p>
                    )}
                </div>
                
                <button onClick={onClose} style={btnStyle}>Done</button>
            </div>
          ) : (
            /* --- SUPPORTER VIEW: Payment Form --- */
            !isGoalReached && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Quick Contribution</label>
                    <div style={quickGridStyle}>
                      {(PRESETS[currency.code] || [10, 25, 50]).map((presetAmt) => {
                        const isSelected = parseFloat(amount) === presetAmt;
                        return (
                          <button
                            key={presetAmt}
                            onClick={() => setAmount(presetAmt.toString())}
                            style={{
                              ...quickBtnBase,
                              backgroundColor: isSelected ? '#6366f1' : '#f8fafc',
                              color: isSelected ? 'white' : '#475569',
                              borderColor: isSelected ? '#6366f1' : '#e2e8f0'
                            }}
                          >
                            {symbol}{presetAmt.toLocaleString()}
                          </button>
                        );
                      })}
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
                    </div>
                  </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Your Email</label>
                  <div style={inputContainer}>
                    <Mail size={16} style={iconStyle} />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: !isEmailValid && buyerEmail ? '#ef4444' : '#e2e8f0'
                      }}
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

                <div 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  style={{
                    ...toggleCardStyle,
                    borderColor: isAnonymous ? '#6366f1' : '#e2e8f0',
                    backgroundColor: isAnonymous ? '#f5f3ff' : '#fff',
                  }}
                >
                  {/* Checkbox wrapper to ensure it doesn't shrink */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isAnonymous} 
                      readOnly 
                      style={{ width: '20px', height: '20px', cursor: 'pointer', margin: 0 }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', lineHeight: '1.2' }}>
                      Stay Anonymous 👤
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Hide your name on the public wishlist.
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          
        </div>

        {/* FIXED FOOTER BUTTON */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
          <button 
                  onClick={handlePayment}
                  disabled={!amount || amount <= 0 || !buyerEmail || loading}
                  style={{...btnStyle, opacity: (!amount || !buyerEmail || loading) ? 0.6 : 1}}
                >
                  {loading ? 'Processing...' : `Confirm Contribution`}
                </button>
          <div style={footerStyle}>
            <ShieldCheck size={12} />
            <span>Secure via SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const progressBarContainer = { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' };
const progressBarFill = { height: '100%', backgroundColor: '#6366f1', transition: 'width 0.5s ease-out' };
const ownerStatsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const statCard = { padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' };
const ownerGiverRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px' };
const exportBtnStyle = { display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', cursor: 'pointer' };

const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' };
const headerStyle = { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const remainingBox = { padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '16px' };
const inputContainer = { position: 'relative', display: 'flex', alignItems: 'flex-start', width: '100%' };
const iconStyle = { position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' };
const prefixStyle = { position: 'absolute', left: '16px', top: '16px', fontWeight: '700', color: '#1e293b' };
const inputStyleWithIcon = { width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const btnStyle = { width: '100%', padding: '16px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' };
const itemText = { fontSize: '14px', margin: '0 0 16px 0', color: '#475569', textAlign: 'left' };
const footerStyle = { marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#94a3b8', fontSize: '11px' };

const overlayStyle = { position: 'fixed', inset: 0, boxShadow: '0 0 0 5000px rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' };
const toggleCardStyle = {
  display: 'flex',
  alignItems: 'center', // This centers them vertically
  justifyContent: 'flex-start',
  gap: '16px', // Increased gap slightly for better breathing room
  padding: '14px 18px',
  borderRadius: '14px',
  border: '2px solid',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  width: '100%' // Ensure it fills the container
};
// ContributeModal.jsx

const modalStyle = { 
  backgroundColor: 'white', 
  borderRadius: '24px', 
  width: '100%', 
  maxWidth: '420px', 
  // FIX: Limit height and enable internal scrolling
  maxHeight: '90vh', 
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Keep the outer container clean
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
  position: 'relative' 
};

// ADD THIS NEW STYLE for the scrollable area
const scrollContentStyle = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1
};

const quickGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
  gap: '10px',
  marginTop: '8px',
  marginBottom: '16px'
};

const quickBtnBase = {
  padding: '12px 8px',
  borderRadius: '12px',
  border: '1.5px solid',
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// Update inputStyle for a cleaner look
const inputStyle = { 
  width: '100%', 
  padding: '14px 14px 14px 40px', 
  borderRadius: '12px', 
  border: '1.5px solid #e2e8f0', 
  fontSize: '16px', 
  fontWeight: '700', 
  outline: 'none',
  boxSizing: 'border-box'
};