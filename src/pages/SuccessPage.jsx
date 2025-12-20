import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Gift } from 'lucide-react';

export default function SuccessPage() {
  const { orderId } = useParams();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <CheckCircle size={64} color="#10b981" />
        <h1 style={{ margin: '20px 0 10px' }}>Gift Sent! 🎁</h1>
        <p style={{ color: '#64748b', textAlign: 'center' }}>
          Your payment was successful. We have notified the creator!
        </p>

        <div style={orderInfoBox}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>ORDER ID</span>
          <code style={{ display: 'block', fontWeight: 'bold' }}>{orderId}</code>
        </div>

        <div style={actionBox}>
          <p style={{ fontSize: '14px', marginBottom: '15px' }}>
            Want to see when the creator receives it?
          </p>
          <Link to={`/track/${orderId}`} style={trackBtn}>
            Track Gift Status <ArrowRight size={18} />
          </Link>
        </div>

        <Link to="/" style={{ marginTop: '20px', color: '#6366f1', textDecoration: 'none' }}>
          Return to Explore
        </Link>
      </div>
    </div>
  );
}

// Quick Styles
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' };
const cardStyle = { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const orderInfoBox = { background: '#f8fafc', padding: '15px', borderRadius: '8px', width: '100%', textAlign: 'center', margin: '20px 0' };
const actionBox = { width: '100%', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' };
const trackBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#1e293b', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' };