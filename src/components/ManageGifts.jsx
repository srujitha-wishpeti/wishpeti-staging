import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Package, Truck, CheckCircle, ExternalLink, Users } from 'lucide-react'; 
import { useToast } from '../context/ToastContext';
import CelebrationModal from '../pages/CelebrationModal';
import { useParams } from 'react-router-dom';

export default function ManageGifts() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  const [balance, setBalance] = useState(0);
  const [hasLinkedBank, setHasLinkedBank] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutType, setPayoutType] = useState('upi'); // 'upi' or 'bank'
  const [payoutData, setPayoutData] = useState({ upiId: '', accName: '', accNum: '', ifsc: '' });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationItem, setCelebrationItem] = useState(null);
  const [username, setUsername] = useState('');
  
  const handleSavePayout = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          
          const details = payoutType === 'upi' 
              ? { type: 'upi', id: payoutData.upiId }
              : { type: 'bank', name: payoutData.accName, number: payoutData.accNum, ifsc: payoutData.ifsc };

          const { error } = await supabase
              .from('creator_profiles')
              .update({ 
                  bank_linked: true,
                  payout_details: details // Store as JSONB in your DB
              })
              .eq('id', user.id);

          if (error) throw error;
          
          setHasLinkedBank(true);
          setIsModalOpen(false);
          showToast("Payout details saved! Funds will settle automatically.");
      } catch (err) {
          showToast("Error saving details: " + err.message, "error");
      }
  };
  // 1. Fetch orders linked to this creator
  const fetchGifts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch Profile Balance
      const { data: profile } = await supabase
        .from('creator_profiles')
        .select('withdrawable_balance, bank_linked, username')
        .eq('id', user.id)
        .single();
      
      if (profile) {
            setBalance(profile.withdrawable_balance || 0);
            setHasLinkedBank(profile.bank_linked || false);
            setUsername(profile.username || '');
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('creator_id', user.id)
        // We show standard gifts (is_crowdfund: false) 
        // AND the 'Master' records for crowdfunding so the list isn't cluttered with tiny partial payments
        .or('is_crowdfund.eq.false,is_crowdfund_master.eq.true')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
      showToast("Failed to load gifts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  // 2. Update the status in the Database
  const handleAction = async (gift, newStatus) => {
    if (newStatus === 'rejected') {
      const confirm = window.confirm("Rejecting will refund the fan via Razorpay (5-7 days). Proceed?");
      if (!confirm) return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ gift_status: newStatus })
        .eq('id', gift.id);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      // Inside handleAction when newStatus === 'accepted' and gift.is_surprise is true
      if (newStatus === 'accepted' && gift.is_surprise) {
          const PLATFORM_FEE = 0.05; 
          const rateUsed = gift.exchange_rate_at_payment || 1;
          
          // 1. Calculate the Net INR amount
          const grossINR = gift.currency_code !== 'INR' 
              ? (Number(gift.total_amount) / rateUsed) 
              : Number(gift.total_amount);
          const netToCreator = grossINR * (1 - PLATFORM_FEE);

          // 2. Fetch the current balance first
          const { data: profile } = await supabase
              .from('creator_profiles')
              .select('withdrawable_balance')
              .eq('id', user.id)
              .single();

          const currentBalance = profile?.withdrawable_balance || 0;

          console.log(profile?.withdrawable_balance);
          console.log(netToCreator);
          // 3. Perform the update
          const { error: balanceError } = await supabase
              .from('creator_profiles')
              .update({ withdrawable_balance: currentBalance + netToCreator })
              .eq('id', user.id);

          if (balanceError) throw balanceError;
          
          // Update local state for the UI balance display
          setBalance(currentBalance + netToCreator);
          console.log(gift);
        }

        if(newStatus === 'accepted'){
          const itemData = {
            title: gift.items?.[0]?.title || "Gift",
            image_url: gift.items?.[0]?.image || "",
            sender: gift.buyer_name // Pass the name here
          };
          setCelebrationItem(itemData);
          setShowCelebration(true);
        }
      // Update local state
      setGifts(prev => prev.map(g => g.id === gift.id ? { ...g, gift_status: newStatus } : g));
      showToast(`Gift marked as ${newStatus}!`);
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("Update failed: " + err.message);
    }
  };

  // Helper for Status Badge Colors
  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return { bg: '#dcfce7', text: '#166534' };
      case 'shipped': return { bg: '#dbeafe', text: '#1e40af' };
      case 'delivered': return { bg: '#f3e8ff', text: '#6b21a8' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#fef3c7', text: '#92400e' }; // pending
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading gifts...</div>;

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          Gifts Received <Package className="text-indigo-600" />
        </h1>
        <p style={{ color: '#64748b' }}>Review and manage your fan gifts and track deliveries.</p>
      </header>

      <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            padding: '24px', 
            borderRadius: '24px', 
            marginBottom: '32px' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                        Total Earned (Settling Soon)
                    </p>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0 0 0', color: '#1e293b' }}>
                        ₹{new Intl.NumberFormat('en-IN').format(balance)}
                    </h2>
                </div>

                {!hasLinkedBank ? (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Setup Payouts
                    </button>
                ) : (
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#16a34a', fontSize: '14px', fontWeight: '700', display: 'block' }}>
                            ✓ Bank Account Linked
                        </span>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Auto-payouts active</p>
                    </div>
                )}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                ℹ️ <strong>RBI Compliance:</strong> Funds are settled to your bank account within T+3 days of acceptance.
            </p>
      </div>
      <p style={{ 
          fontSize: '12px', 
          color: '#94a3b8', 
          marginTop: '8px', 
          textAlign: 'left' 
      }}>
          *Balance shown is after the 5% Peti service fee.
      </p>
      

      {isModalOpen && (
          <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                  <h3 style={{ marginTop: 0 }}>Setup Your Payouts 💸</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                      To comply with <strong>RBI regulations</strong>, Peti cannot hold funds in a wallet. 
                      Your earnings are transferred directly to you.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <button 
                          onClick={() => setPayoutType('upi')}
                          style={payoutType === 'upi' ? activeTabStyle : inactiveTabStyle}>UPI ID</button>
                      <button 
                          onClick={() => setPayoutType('bank')}
                          style={payoutType === 'bank' ? activeTabStyle : inactiveTabStyle}>Bank Account</button>
                  </div>

                  {payoutType === 'upi' ? (
                      <input 
                          placeholder="vpa@bankname" 
                          value={payoutData.upiId}
                          onChange={(e) => setPayoutData({...payoutData, upiId: e.target.value})}
                          style={inputStyle} 
                      />
                  ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                          <input placeholder="Account Holder Name" onChange={(e) => setPayoutData({...payoutData, accName: e.target.value})} style={inputStyle} />
                          <input placeholder="Account Number" onChange={(e) => setPayoutData({...payoutData, accNum: e.target.value})} style={inputStyle} />
                          <input placeholder="IFSC Code" onChange={(e) => setPayoutData({...payoutData, ifsc: e.target.value})} style={inputStyle} />
                      </div>
                  )}

                  <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                      <button onClick={handleSavePayout} style={saveButtonStyle}>Save & Enable Payouts</button>
                      <button onClick={() => setIsModalOpen(false)} style={cancelButtonStyle}>Maybe Later</button>
                  </div>
              </div>
          </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {gifts.length === 0 ? (
           <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px', border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#f8fafc' }}>
             <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
             <p>No gifts received yet.</p>
             <button 
                onClick={() => {
                  navigator.clipboard.writeText(`wishpeti.com/${username}`);
                  showToast("Link copied!");
                }}
                style={copyLinkBtnStyle}
              >
                Copy My Wishlist Link
              </button>
           </div>
        ) : (
          gifts.map((gift, index) => {
            const statusStyle = getStatusStyle(gift.gift_status);
            // Check if this is a crowdfunded item or contribution
            const isCrowdfund = gift.is_crowdfund === true || gift.is_crowdfund_master === true;
            
            return (
              <div 
                key={gift.id || index}
                style={{ 
                  padding: '24px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  opacity: gift.gift_status === 'rejected' ? 0.7 : 1
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                        {gift.items?.[0]?.title || "Gift Item"}
                    </h3>
                    {isCrowdfund && (
                        <span style={{ 
                            background: '#e0e7ff', 
                            color: '#4338ca', 
                            fontSize: '10px', 
                            fontWeight: 'bold', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Users size={12} /> CROWDFUND
                        </span>
                    )}
                  </div>
                  
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b' }}>
                    From: <strong style={{ color: '#475569' }}>{gift.buyer_name}</strong>
                  </p>

                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b' }}>
                    Message: <strong style={{ color: '#475569' }}>{gift.buyer_message}</strong>
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {gift.gift_status}
                    </span>

                    {gift.tracking_details && (
                      <a 
                        href={gift.tracking_details.startsWith('http') ? gift.tracking_details : '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ 
                          fontSize: '13px', 
                          color: '#6366f1', 
                          textDecoration: 'none', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontWeight: '600' 
                        }}
                      >
                        <Truck size={14} /> Track <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', marginLeft: '24px' }}>
                  <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '20px', marginBottom: '8px' }}>
                    {new Intl.NumberFormat(gift.currency_code === 'INR' ? 'en-IN' : 'en-US', {
                        style: 'currency',
                        currency: gift.currency_code || 'INR',
                        maximumFractionDigits: gift.currency_code === 'INR' ? 0 : 2
                    }).format(gift.total_amount)}
                  </div>
                  
                  {/* BUTTON LOGIC: Hide Accept/Reject if it's a Crowdfund */}
                  {gift.gift_status === 'pending' && !isCrowdfund && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleAction(gift, 'accepted')} 
                        style={{ 
                            background: '#6366f1', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleAction(gift, 'rejected')} 
                        style={{ 
                            background: 'white', 
                            color: '#ef4444', 
                            border: '1px solid #ef4444', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            fontSize: '14px' 
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Crowdfund status text */}
                  {isCrowdfund && gift.gift_status === 'pending' && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                      Auto-processed contribution
                    </p>
                  )}

                  {gift.gift_status === 'shipped' && (
                    <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      <CheckCircle size={14} /> In Transit
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {showCelebration && (
          <CelebrationModal 
            item={celebrationItem}
            username={username}
            onClose={() => setShowCelebration(false)}
          />
        )}
    </div>
  );
}

const emptyStateStyle = { 
  textAlign: 'center', 
  color: '#94a3b8', 
  padding: '60px', 
  border: '2px dashed #e2e8f0', 
  borderRadius: '24px', 
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px'
};

const copyLinkBtnStyle = {
  background: '#6366f1',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'transform 0.2s',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
};

// Styles for the Payout Modal
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalContentStyle = {
    background: 'white',
    padding: '32px',
    borderRadius: '24px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const activeTabStyle = {
    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
    background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer'
  };

  const inactiveTabStyle = {
    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0',
    background: 'white', color: '#64748b', cursor: 'pointer'
  };

  const saveButtonStyle = {
    flex: 2, background: '#6366f1', color: 'white', border: 'none',
    padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
  };

  const cancelButtonStyle = {
    flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none',
    padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
  };