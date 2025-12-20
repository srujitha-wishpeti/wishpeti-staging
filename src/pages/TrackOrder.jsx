import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function TrackOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Checking gift status...</div>;

  if (!order) return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <h3>Order not found</h3>
      <p>Please check your link and try again.</p>
    </div>
  );

  return (
    <div style={{ 
      padding: '60px 20px', 
      maxWidth: '500px', 
      margin: '0 auto', 
      fontFamily: 'sans-serif',
      textAlign: 'center' 
    }}>
      <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎁</div>
      <h2 style={{ color: '#1e293b' }}>Gift Tracking</h2>
      <p style={{ color: '#64748b' }}>Order ID: {order.id.slice(0, 8)}...</p>

      <div style={{ 
        margin: '30px 0', 
        padding: '20px', 
        borderRadius: '12px', 
        background: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Current Status
        </p>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: order.gift_status === 'shipped' ? '#6366f1' : '#1e293b' 
        }}>
          {order.gift_status.toUpperCase()}
        </div>
      </div>

      {order.tracking_details && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ color: '#64748b', marginBottom: '10px' }}>Tracking Information:</p>
          <a 
            href={order.tracking_details.startsWith('http') ? order.tracking_details : '#'} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Track Package 🚚
          </a>
        </div>
      )}

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
      <p style={{ fontSize: '12px', color: '#94a3b8' }}>
        Thank you for supporting your favorite creators through WishPeti.
      </p>
    </div>
  );
}