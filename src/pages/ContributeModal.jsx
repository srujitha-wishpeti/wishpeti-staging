import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function ContributeModal({ item, currency, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Convert the DB values (INR) to the User's Display Currency
  const displayGoal = (item.price * currency.rate);
  const displayRaised = (item.amount_raised || 0) * currency.rate;
  const displayRemaining = Math.max(displayGoal - displayRaised, 0);

  const handlePayment = async () => {
    if (!amount || amount <= 0) return;
    setLoading(true);

    try {
      // Razorpay calculation: 
      // User types $10 -> Convert to INR -> Convert to Paise
      const amountInINR = currency.code === 'INR' ? amount : (amount / currency.rate);
      const amountInPaise = Math.round(amountInINR * 100);

      const options = {
        key: "rzp_test_RtgvVK9ZMU6pKm", 
        amount: amountInPaise, 
        currency: "INR", 
        display_currency: currency.code, // Shows local currency in Razorpay UI
        display_amount: amount,          // Shows the exact amount they entered
        name: "WishPeti",
        description: `Contribution for ${item.title}`,
        handler: async function (response) {
          await handleContributionRecord(response, amount); 
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
    // 1. Convert to base INR
    const amountInINR = currency.code !== 'INR' 
        ? Math.ceil(paidAmount / currency.rate) 
        : Math.ceil(paidAmount);

    // 2. Create the Order Record (Historical Proof)
    const { error: orderError } = await supabase
        .from('orders')
        .insert([{
        razorpay_payment_id: response.razorpay_payment_id,
        item_id: item.id,
        creator_id: item.creator_id,
        total_amount: amountInINR,
        payment_status: 'paid',
        is_crowdfund_contribution: true,
        gift_status: 'pending'
        }]);

    if (orderError) throw orderError;

    // 3. UPDATE THE WISHLIST ITEM (The Progress Bar Truth)
    // We use an RPC (Remote Procedure Call) or a simple increment logic
    const { error: updateError } = await supabase.rpc('increment_wishlist_raised', {
        row_id: item.id,
        increment_by: amountInINR
    });

    // Fallback if you haven't set up the RPC function yet:
    if (updateError) {
        const { error: fallbackError } = await supabase
        .from('wishlist_items')
        .update({ amount_raised: (item.amount_raised || 0) + amountInINR })
        .eq('id', item.id);
        
        if (fallbackError) throw fallbackError;
    }
    
    window.dispatchEvent(new Event('contributionUpdated'));
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Contribute to Gift 🎁</h3>
          <X onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ padding: '20px' }}>
          <p style={itemText}>Item: <strong>{item.title}</strong></p>
          
          <div style={remainingBox}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Remaining Goal:</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {currency.symbol}{displayRemaining.toLocaleString()}
            </div>
          </div>

          <label style={labelStyle}>How much would you like to give?</label>
          <div style={inputContainer}>
            <span style={prefixStyle}>{currency.symbol}</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              style={inputStyle}
            />
          </div>

          <button 
            onClick={handlePayment}
            disabled={!amount || amount <= 0 || loading}
            style={btnStyle}
          >
            {loading ? 'Processing...' : `Confirm Contribution`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick Styles
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden' };
const headerStyle = { padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const remainingBox = { backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' };
const inputContainer = { position: 'relative', display: 'flex', alignItems: 'center' };
const prefixStyle = { position: 'absolute', left: '12px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '16px' };
const btnStyle = { width: '100%', marginTop: '20px', padding: '14px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' };
const itemText = { fontSize: '14px', marginBottom: '15px', color: '#334155' };