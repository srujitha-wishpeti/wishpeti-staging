import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function UrlInputForm({ 
  url, 
  onUrlChange, 
  scrapedData, 
  editableData, 
  setEditableData, 
  scraping, 
  error, 
  onContinue, 
  onCancel, 
  loading, 
  isEditing, 
  currencySymbol, 
  currencyCode 
}) {

  const handleEdit = (field, value) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button onClick={onCancel} style={closeButtonStyle}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* URL Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Product Link</label>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://..."
              disabled={isEditing} 
              style={{ ...inputStyle, backgroundColor: isEditing ? '#f8fafc' : '#fff' }}
            />
            {scraping && (
              <div style={statusTextStyle}>
                <Loader2 size={14} className="animate-spin" /> Fetching details...
              </div>
            )}
            {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
          </div>

          {(scrapedData || isEditing) && (
            <>
              {/* Title Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Item Name</label>
                <input 
                  value={editableData.title} 
                  onChange={(e) => handleEdit('title', e.target.value)}
                  style={inputStyle}
                  placeholder="What is this gift called?"
                />
              </div>

              {/* Price & Quantity Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Price</label>
                  <div style={priceContainerStyle}>
                    <div style={currencySideLabel}>{currencyCode}</div>
                    <div style={inputWithSymbolStyle}>
                      <span style={symbolStyle}>{currencySymbol}</span>
                      <input 
                        type="text"
                        value={editableData.price} 
                        onChange={(e) => handleEdit('price', e.target.value)}
                        style={blankInputStyle}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Qty</label>
                  <input 
                    type="number" 
                    value={editableData.quantity || 1} 
                    onChange={(e) => setEditableData({ ...editableData, quantity: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* CROWDFUNDING SECTION - Fixed ReferenceError */}
              <div 
                onClick={() => handleEdit('is_crowdfund', !editableData.is_crowdfund)}
                style={{
                  ...crowdfundCardStyle,
                  borderColor: editableData.is_crowdfund ? '#3b82f6' : '#e2e8f0',
                  backgroundColor: editableData.is_crowdfund ? '#eff6ff' : '#fff',
                  borderWidth: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <input 
                    type="checkbox" 
                    checked={editableData.is_crowdfund}
                    onChange={() => {}} // Div onClick handles toggle
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
                    Enable Crowdfunding 💰
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Fans can contribute any amount instead of buying the whole gift.
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Notes (Optional)</label>
                <textarea 
                  value={editableData.notes || ''} 
                  onChange={(e) => handleEdit('notes', e.target.value)}
                  placeholder="Size, color, or a message for your fans..."
                  style={{ ...inputStyle, height: '80px', resize: 'none' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button 
            disabled={(!scrapedData && !isEditing) || loading} 
            onClick={onContinue} 
            style={{ 
              ...submitButtonStyle, 
              backgroundColor: (scrapedData || isEditing) ? '#1e293b' : '#cbd5e1',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isEditing ? 'Save Changes' : 'Add to Wishlist')}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---

const modalOverlayStyle = { 
  position: 'fixed', 
  inset: 0, 
  backgroundColor: 'rgba(0,0,0,0.5)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  zIndex: 10000, 
  padding: '20px' 
};

const modalContentStyle = { 
  backgroundColor: 'white', 
  borderRadius: '16px', 
  width: '100%', 
  maxWidth: '440px', 
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const headerStyle = { 
  padding: '1.25rem', 
  borderBottom: '1px solid #f1f5f9', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
};

const labelStyle = { 
  display: 'block', 
  fontSize: '11px', 
  fontWeight: '700', 
  marginBottom: '6px', 
  color: '#64748b', 
  textTransform: 'uppercase', 
  letterSpacing: '0.05em' 
};

const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '10px', 
  border: '1px solid #e2e8f0', 
  fontSize: '15px', 
  outline: 'none', 
  color: '#1e293b'
};

const priceContainerStyle = { 
  display: 'flex', 
  border: '1px solid #e2e8f0', 
  borderRadius: '10px', 
  overflow: 'hidden', 
  height: '46px' 
};

const currencySideLabel = { 
  backgroundColor: '#f8fafc', 
  padding: '0 12px', 
  display: 'flex', 
  alignItems: 'center', 
  fontSize: '12px', 
  fontWeight: '800', 
  color: '#64748b', 
  borderRight: '1px solid #e2e8f0' 
};

const inputWithSymbolStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  flex: 1, 
  paddingLeft: '10px', 
  backgroundColor: '#fff' 
};

const symbolStyle = { 
  color: '#94a3b8', 
  marginRight: '4px', 
  fontSize: '16px' 
};

const blankInputStyle = { 
  border: 'none', 
  outline: 'none', 
  width: '100%', 
  fontSize: '16px', 
  color: '#1e293b',
  fontWeight: '500'
};

const crowdfundCardStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '14px', 
  padding: '16px', 
  borderRadius: '12px', 
  borderStyle: 'solid', 
  cursor: 'pointer', 
  marginBottom: '1.25rem',
  transition: 'all 0.2s ease'
};

const footerStyle = { 
  padding: '1.25rem', 
  borderTop: '1px solid #f1f5f9',
  backgroundColor: '#fcfcfc',
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px'
};

const submitButtonStyle = { 
  width: '100%', 
  padding: '14px', 
  borderRadius: '12px', 
  color: 'white', 
  border: 'none', 
  fontSize: '15px',
  fontWeight: '700', 
  cursor: 'pointer',
  transition: 'transform 0.1s active'
};

const closeButtonStyle = { 
  background: 'none', 
  border: 'none', 
  cursor: 'pointer', 
  color: '#94a3b8',
  padding: '4px'
};

const statusTextStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '6px', 
  color: '#3b82f6', 
  fontSize: '12px', 
  marginTop: '8px',
  fontWeight: '500'
};