import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Package, Truck, CheckCircle, ExternalLink } from 'lucide-react'; // Added icons for better UI
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
        .or('is_crowdfund.eq.false,is_crowdfund_master.eq.true')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
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
      <h1 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Gifts Received <Package />
      </h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Review and manage your fan gifts and track deliveries.</p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {gifts.length === 0 ? (
           <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
             No gifts received yet. Share your link to get started!
           </p>
        ) : (
          gifts.map((gift, index) => {
            const statusStyle = getStatusStyle(gift.gift_status);
            return (
              <div 
                key={gift.id || index} // ✅ FIXED: Unique key prop
                style={{ 
                  padding: '20px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{gift.items?.[0]?.title || "Gift Item"}</h3>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>From: <strong>{gift.buyer_name}</strong></p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {gift.gift_status}
                    </span>

                    {/* ✅ NEW: Tracking Details Link */}
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
                          fontWeight: '500' 
                        }}
                      >
                        <Truck size={14} /> Track Package <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px' }}>
                    {new Intl.NumberFormat(gift.currency_code === 'INR' ? 'en-IN' : 'en-US', {
                        style: 'currency',
                        currency: gift.currency_code || 'INR', // 🚀 Use the code saved with the GIFT
                        maximumFractionDigits: gift.currency_code === 'INR' ? 0 : 2
                    }).format(gift.total_amount)}
                  </div>
                  
                  {gift.gift_status === 'pending' && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleAction(gift.id, 'accepted')} 
                        style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleAction(gift.id, 'rejected')} 
                        style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {gift.gift_status === 'shipped' && (
                    <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      <CheckCircle size={14} /> On its way!
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