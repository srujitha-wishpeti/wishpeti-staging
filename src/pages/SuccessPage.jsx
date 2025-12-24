import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, TrendingUp, PartyPopper } from 'lucide-react';

export default function SuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  
  // Grab the impact data we passed from navigate()
  const impact = location.state?.impact || [];

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <CheckCircle size={64} color="#10b981" />
        <h1 style={{ margin: '20px 0 10px' }}>Gift Sent! 🎁</h1>
        <p style={{ color: '#64748b', textAlign: 'center' }}>
          Your payment was successful. We have notified the creator!
        </p>

        {/* --- NEW IMPACT SECTION --- */}
        {impact.length > 0 && (
          <div style={impactCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TrendingUp size={18} color="#6366f1" />
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>YOUR SURPRISE IMPACT</span>
            </div>
            {impact.map((item, idx) => (
              <div key={idx} style={impactItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.fullyFunded ? <PartyPopper size={14} color="#f59e0b" /> : <TrendingUp size={14} color="#10b981" />}
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.title}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {item.fullyFunded ? 'Fully Funded!' : 'Progress Boosted'}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* --- END IMPACT SECTION --- */}

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

// Keep your existing styles and add these:
const impactCardStyle = {
  width: '100%',
  background: '#eef2ff', // Soft indigo background
  padding: '16px',
  borderRadius: '12px',
  margin: '10px 0',
  border: '1px solid #e0e7ff'
};

const impactItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px dashed #c7d2fe',
  lastChild: { borderBottom: 'none' }
};

// ... your existing containerStyle, cardStyle, etc.
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' };
const cardStyle = { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const orderInfoBox = { background: '#f8fafc', padding: '15px', borderRadius: '8px', width: '100%', textAlign: 'center', margin: '20px 0' };
const actionBox = { width: '100%', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' };
const trackBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#1e293b', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' };