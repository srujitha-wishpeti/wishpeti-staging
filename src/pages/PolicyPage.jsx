import React from 'react';

const PolicyPage = ({ title, content }) => {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <hr style={dividerStyle} />
        {/* This is the magic line that renders the HTML strings from your routes */}
        <div 
          className="policy-content"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
      
      {/* Small footer back button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

// Basic Professional Styling
const containerStyle = {
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  padding: '40px 20px',
  fontFamily: 'Inter, system-ui, sans-serif'
};

const cardStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lineHeight: '1.6'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#1e293b',
  marginBottom: '10px'
};

const dividerStyle = {
  border: '0',
  height: '1px',
  background: '#e2e8f0',
  marginBottom: '30px'
};

const contentStyle = {
  color: '#334155',
  fontSize: '16px',
};

export default PolicyPage;