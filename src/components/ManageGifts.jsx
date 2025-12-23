import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Package, Truck, CheckCircle, ExternalLink, Users } from 'lucide-react'; 
import { useToast } from '../context/ToastContext';

export default function ManageGifts() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  
  // 1. Fetch orders linked to this creator
  const fetchGifts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
  const handleAction = async (id, newStatus) => {
    if (newStatus === 'rejected') {
      const confirm = window.confirm("Rejecting will refund the fan via Razorpay (5-7 days). Proceed?");
      if (!confirm) return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ gift_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setGifts(prev => prev.map(g => g.id === id ? { ...g, gift_status: newStatus } : g));
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

      <div style={{ display: 'grid', gap: '20px' }}>
        {gifts.length === 0 ? (
           <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px', border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#f8fafc' }}>
             <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
             <p>No gifts received yet. Share your link to get started!</p>
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
                        onClick={() => handleAction(gift.id, 'accepted')} 
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
                        onClick={() => handleAction(gift.id, 'rejected')} 
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
    </div>
  );
}