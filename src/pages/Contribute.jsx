import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Gift, Users, ShieldCheck } from 'lucide-react';

export default function ContributePage({ currency }) {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItemDetails() {
      // Fetch item and existing successful orders for this item
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          orders (total_amount, payment_status)
        `)
        .eq('id', itemId)
        .single();

      if (!error) {
        // Calculate total raised from 'paid' orders
        const totalRaised = data.orders
          ?.filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        
        setItem({ ...data, totalRaised });
      }
      setLoading(false);
    }
    fetchItemDetails();
  }, [itemId]);

  if (loading) return <div style={centerStyle}>Loading Gift...</div>;
  if (!item) return <div style={centerStyle}>Gift not found.</div>;

  const goalAmount = item.price * (item.quantity || 1);
  const progressPercent = Math.min((item.totalRaised / goalAmount) * 100, 100);
  const remainingAmount = Math.max(goalAmount - item.totalRaised, 0);

  return (
    <div style={pageWrapper}>
      <div style={contributeCard}>
        {/* Product Preview */}
        <img src={item.image} alt={item.title} style={productImg} />
        
        <div style={{ padding: '24px' }}>
          <h1 style={itemTitle}>{item.title}</h1>
          <p style={creatorText}>Wishlist by User #{item.creator_id.slice(0,5)}</p>

          {/* Progress Section */}
          <div style={progressContainer}>
            <div style={progressHeader}>
              <span style={raisedText}>{currency.symbol}{item.totalRaised.toLocaleString()} raised</span>
              <span style={goalText}>target {currency.symbol}{goalAmount.toLocaleString()}</span>
            </div>
            <div style={progressBarBg}>
              <div style={{ ...progressBarFill, width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Contribution Input */}
          <div style={{ marginTop: '24px' }}>
            <label style={inputLabel}>Enter your contribution ({currency.code})</label>
            <div style={inputWrapper}>
              <span style={currencyPrefix}>{currency.symbol}</span>
              <input 
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder={`Remaining: ${remainingAmount}`}
                style={amountInput}
              />
            </div>
          </div>

          <button 
            disabled={!contributionAmount || contributionAmount <= 0}
            style={payButtonStyle}
            onClick={() => {/* Trigger your Razorpay/Stripe Logic here */}}
          >
            Contribute {currency.symbol}{contributionAmount || '0'}
          </button>

          <div style={securityNote}>
            <ShieldCheck size={14} />
            <span>Secure payment via Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const pageWrapper = { backgroundColor: '#fdfcfe', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' };
const contributeCard = { backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const productImg = { width: '100%', height: '280px', objectFit: 'cover' };
const itemTitle = { fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' };
const creatorText = { fontSize: '14px', color: '#64748b', marginBottom: '24px' };

const progressContainer = { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '20px' };
const progressHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' };
const raisedText = { fontWeight: '700', color: '#3b82f6' };