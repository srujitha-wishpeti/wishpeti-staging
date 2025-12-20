// src/components/ManageGifts.jsx
import React, { useState } from 'react';

const ManageGifts = () => {
  const [gifts, setGifts] = useState([
    { id: 1, item: "Designer Saree", fan: "Ananya R.", status: "pending", price: "₹4,500" },
    { id: 2, item: "Vlogging Mic", fan: "TechReviewer", status: "pending", price: "₹8,200" }
  ]);

  const updateStatus = (id, newStatus) => {
    setGifts(gifts.map(g => g.id === id ? { ...g, status: newStatus } : g));
    if (newStatus === 'rejected') {
      alert("Refund initiated. Fan will receive funds in 5-7 days.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#6366f1' }}>Manage Your WishPeti 📦</h2>
      <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        {gifts.map(gift => (
          <div key={gift.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0 }}>{gift.item}</h4>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>From: {gift.fan} • {gift.price}</p>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: gift.status === 'pending' ? '#fef3c7' : '#dcfce7', color: gift.status === 'pending' ? '#92400e' : '#166534' }}>
                {gift.status.toUpperCase()}
              </span>
            </div>
            {gift.status === 'pending' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => updateStatus(gift.id, 'accepted')} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Accept</button>
                <button onClick={() => updateStatus(gift.id, 'rejected')} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageGifts;