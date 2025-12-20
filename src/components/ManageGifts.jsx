import React, { useState } from 'react';

export default function ManageGifts() {
  // We define the data directly inside the state to avoid ReferenceErrors
  const [gifts, setGifts] = useState([
    {
      id: "wish_001",
      item_name: "Bullion Knot Designer Saree",
      fan_name: "Rajesh Kumar",
      amount: 7999,
      net_payout: 7359,
      status: "pending",
      date: "20 Dec 2025",
      payment_id: "pay_xyz123"
    },
    {
      id: "wish_002",
      item_name: "Sony Vlogging Mic",
      fan_name: "Anonymous Fan",
      amount: 12500,
      net_payout: 11500,
      status: "accepted",
      date: "19 Dec 2025",
      payment_id: "pay_abc789"
    }
  ]);

  const handleAction = (id, newStatus) => {
    if (newStatus === 'rejected') {
      const confirm = window.confirm("Rejecting will refund the fan via Razorpay (5-7 days). Proceed?");
      if (!confirm) return;
    }
    setGifts(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
  };

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1e293b' }}>Gifts Received 📦</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Review and manage your fan gifts.</p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {gifts.map(gift => (
          <div key={gift.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
            <div>
              <h3 style={{ margin: 0 }}>{gift.item_name}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>From: {gift.fan_name}</p>
              <span style={{ 
                fontSize: '11px', 
                padding: '3px 8px', 
                borderRadius: '12px', 
                background: gift.status === 'pending' ? '#fef3c7' : '#dcfce7',
                color: gift.status === 'pending' ? '#92400e' : '#166534',
                fontWeight: 'bold'
              }}>
                {gift.status.toUpperCase()}
              </span>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#6366f1' }}>₹{gift.net_payout.toLocaleString()}</div>
              {gift.status === 'pending' && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleAction(gift.id, 'accepted')} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Accept</button>
                  <button onClick={() => handleAction(gift.id, 'rejected')} style={{ background: 'none', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}