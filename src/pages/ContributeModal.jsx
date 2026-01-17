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

  // NEW: Logic to fill the exact remaining amount
  const handlePayRemaining = () => {
    const exactAmount = Math.ceil(displayRemaining * 100) / 100;
    setAmount(exactAmount.toString());
  };

  const handlePayment = () => {
    let inputAmount = parseFloat(amount);
    
    // 1. Synchronous validation
    if (!inputAmount || inputAmount <= 0 || !buyerEmail) {
      alert("Please enter a valid amount and email.");
      return;
    }

    if (inputAmount > displayRemaining) {
      inputAmount = Math.ceil(displayRemaining * 100) / 100;
      setAmount(inputAmount.toString()); 
    }

    setLoading(true);

    // 2. Preparation (No Awaits here)
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
        // DB work happens AFTER the pop-up is gone
        await handleContributionRecord(response, inputAmount); 
        onSuccess(); 
      },
      theme: { color: "#6366f1" },
      modal: { ondismiss: () => setLoading(false) }
    };

    // 3. Open Razorpay immediately
    try {
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

    // 1. Calculate if this specific contribution completes the goal
    const newRaisedTotal = (item.amount_raised || 0) + contributionInINR;
    // Using a small epsilon (0.1) to handle floating point rounding issues
    const isNowFullyFunded = newRaisedTotal >= (totalGoalBase - 0.1); 

    logSupportEvent('contribution_to_crowdfund', item.creator_id, { amount: contributionInINR });
    
    // 2. Insert the order with the MASTER flag if it completes the goal
    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          razorpay_payment_id: response.razorpay_payment_id,
          item_id: item.id,
          creator_id: item.creator_id,
          total_amount: contributionInINR,
          exchange_rate_at_payment: currency.rate,
          payment_status: 'paid',
          is_crowdfund: true,
          // --- THE FIX ---
          is_crowdfund_master: isNowFullyFunded, 
          // ----------------
          gift_status: 'pending',
          buyer_name: isAnonymous ? "Anonymous" : (buyerName || "Kind Supporter"),
          buyer_email: buyerEmail,
          buyer_message: buyerMessage
        }])
        .select()
        .single();

    if (orderError) throw orderError;

    // 3. Log the transaction
    const { error: transError } = await supabase
    .from('transactions')
    .insert([{
        creator_id: item.creator_id,
        order_id: newOrder.id,
        provider_payment_id: response.razorpay_payment_id,
        amount_inr: contributionInINR,
        currency_code: currency.code,
        type: 'gift_payment',
        status: 'success',
        currency_rate: currency.rate
    }]);

    if (transError) console.error("Transaction log failed:", transError.message);

    // 4. Update the wishlist item status
    const updatePayload = { amount_raised: isNowFullyFunded ? totalGoalBase : newRaisedTotal };
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
    if (onSuccess) onSuccess(); // Ensure the UI refreshes
  };

  const isGoalReached = displayRemaining <= 0.01;

  const handleSelectWinner = async (giverData) => {
    setLoading(true);
    try {
      // 1. Generate a longer, safer token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // 2. Database update
      const { error: dbError } = await supabase
        .from('wishlist_items')
        .update({ 
          status: 'waiting_for_claim',
          claim_token: token,
          winner_name: giverData?.buyer_name || 'Giveaway Winner'
        })
        .eq('id', item.id);

      if (dbError) {
        console.error("Supabase Error details:", dbError);
        alert(`Database Error: ${dbError.message}. Did you add the claim_token column?`);
        return;
      }

      // 3. Only if DB succeeds, copy link
      const claimLink = `${window.location.origin}/claim_token/${token}`;
      await navigator.clipboard.writeText(claimLink);
      
      alert("🏆 Success! Claim link copied to clipboard.");
      
      if (onSuccess) onSuccess(); 
      onClose();
    } catch (err) {
      console.error("General Error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
                {/* --- GIVEAWAY MANAGEMENT SECTION --- */}
                {isOwner && item.is_giveaway && isGoalReached && (
                  item.status === 'waiting_for_claim' ? (
                    <div style={activeStatusStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ color: '#10b981', fontWeight: '800', fontSize: '14px' }}>Link Active! 🎉</div>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                        The claim link is ready. Send it to your winner so they can enter their address.
                      </p>
                      <button 
                        onClick={() => {
                          const link = `${window.location.origin}/claim_token/${item.claim_token}`;
                          navigator.clipboard.writeText(link);
                          alert("Link copied again! 📋");
                        }}
                        style={{ ...generateBtnStyle, backgroundColor: '#1e293b', marginTop: '4px' }}
                      >
                        Copy Link Again
                      </button>
                    </div>
                  ) : (
                    <div style={generateBoxStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Goal Reached! 🏆</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Generate a claim link for your winner.</div>
                      </div>
                      <button 
                        onClick={() => handleSelectWinner({ buyer_name: 'Giveaway Winner' })}
                        disabled={loading}
                        style={generateBtnStyle}
                      >
                        {loading ? 'Generating...' : 'Copy Claim Link'}
                      </button>
                    </div>
                  )
                )}

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
            !isGoalReached && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>Quick Contribution</label>
                        <button onClick={handlePayRemaining} style={payRemainingBtnStyle}>Remaining: {symbol}{displayRemaining.toFixed(2)}</button>
                    </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input type="checkbox" checked={isAnonymous} readOnly style={{ width: '20px', height: '20px', cursor: 'pointer', margin: 0 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', lineHeight: '1.2' }}>Stay Anonymous 👤</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Hide your name on the public wishlist.</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {!isOwner && (
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
        )}
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
const toggleCardStyle = { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '14px 18px', borderRadius: '14px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', width: '100%' };
const modalStyle = { backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '420px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' };
const quickGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginTop: '8px', marginBottom: '16px' };
const quickBtnBase = { padding: '12px 8px', borderRadius: '12px', border: '1.5px solid', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const inputStyle = { width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '16px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' };

// NEW: Matching style for the "Remaining" button
const payRemainingBtnStyle = { background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#6366f1', cursor: 'pointer' };
const activeStatusStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box', // Fixes the width overflow
  padding: '16px',
  backgroundColor: '#f0fdf4',
  borderRadius: '16px',
  border: '1px solid #bbf7d0',
  gap: '8px',
  marginBottom: '20px'
};

const generateBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box', // Fixes the width overflow
  padding: '16px',
  backgroundColor: '#f5f3ff',
  borderRadius: '16px',
  border: '1px solid #ddd6fe',
  marginBottom: '20px',
  gap: '12px'
};

const generateBtnStyle = {
  padding: '10px 16px',
  borderRadius: '10px',
  backgroundColor: '#6366f1',
  color: 'white',
  fontSize: '12px',
  fontWeight: '700',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s'
};