import React from 'react';
import { X, Loader2, Lock } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

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

  // SAFETY LOCK: Disable editing critical financial fields if money has been raised
  const hasFunds = editableData?.amount_raised > 0;

  const { currency, formatPrice, convertPrice } = useCurrency(); // Added currency logic

  const handleEdit = (field, value) => {
    if (hasFunds && (field === 'price' || field === 'quantity' || field === 'is_crowdfund')) {
      return; // Do nothing if field is locked
    }
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `item-uploads/${fileName}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file);

    if (uploadError) {
      showToast("Image upload failed");
    } else {
      // 2. Get Public URL
      const { data } = supabase.storage.from('item-images').getPublicUrl(filePath);
      // 3. Update the editableData so the form shows the new image
      setEditableData(prev => ({ ...prev, image_url: data.publicUrl }));
    }
    setUploading(false);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* FIXED HEADER */}
        <div style={headerStyle}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button onClick={onCancel} style={closeButtonStyle}>
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY (Preserving all logic) */}
        <div style={scrollableBodyStyle}>
          
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

          {(scrapedData || isEditing || error) && (
            <>
              {/* Title Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Item Name</label>
                <input 
                  value={editableData.title || ''} 
                  onChange={(e) => handleEdit('title', e.target.value)}
                  style={inputStyle}
                  placeholder="What is this gift called?"
                />
              </div>

              {/* Image Section - Conditional Rendering */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Item Image</label>
                
                {!editableData.image_url || editableData.image_url === '/placeholder.png' ? (
                  // CASE A: No Image - Show Big Upload Button
                  <div style={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>No image found</p>
                      <p style={{ margin: 0 }}>Click to upload a photo</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    />
                  </div>
                ) : (
                  // CASE B: Image Exists - Show Preview with small 'Edit' option
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '8px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px' 
                  }}>
                    <img 
                      src={editableData.image_url} 
                      alt="Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>Image Loaded</div>
                      <label style={{ 
                        fontSize: '11px', 
                        color: '#6366f1', 
                        cursor: 'pointer', 
                        fontWeight: '700',
                        textDecoration: 'underline'
                      }}>
                        Replace Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                      </label>
                    </div>
                  </div>
                )}
                
                {uploading && (
                  <div style={{ ...statusTextStyle, marginTop: '8px' }}>
                    <Loader2 size={12} className="animate-spin" /> Uploading to server...
                  </div>
                )}
              </div>

              {/* Price & Quantity Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Price</label>
                  <div style={{ ...priceContainerStyle, backgroundColor: hasFunds ? '#f8fafc' : '#fff' }}>
                    <div style={currencySideLabel}>{currencyCode}</div>
                    <div style={inputWithSymbolStyle}>
                      <span style={symbolStyle}>{currencySymbol}</span>
                      <input 
                        type="text"
                        value={scrapedData ? editableData.price : formatPrice(editableData.price) || ''} 
                        onChange={(e) => handleEdit('price', e.target.value)}
                        disabled={hasFunds}
                        style={{ 
                          ...blankInputStyle, 
                          backgroundColor: hasFunds ? '#f8fafc' : 'transparent',
                          cursor: hasFunds ? 'not-allowed' : 'text'
                        }}
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
                    onChange={(e) => handleEdit('quantity', e.target.value)}
                    disabled={hasFunds}
                    style={{ 
                      ...inputStyle, 
                      backgroundColor: hasFunds ? '#f8fafc' : '#fff',
                      cursor: hasFunds ? 'not-allowed' : 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* CROWDFUNDING SECTION */}
              <div 
                onClick={() => !hasFunds && handleEdit('is_crowdfund', !editableData.is_crowdfund)}
                style={{
                  ...crowdfundCardStyle,
                  borderColor: editableData.is_crowdfund ? '#6366f1' : '#e2e8f0',
                  backgroundColor: hasFunds ? '#f8fafc' : (editableData.is_crowdfund ? '#f5f3ff' : '#fff'),
                  borderWidth: '2px',
                  cursor: hasFunds ? 'not-allowed' : 'pointer',
                  opacity: hasFunds ? 0.8 : 1,
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={editableData.is_crowdfund || false}
                    readOnly 
                    disabled={hasFunds}
                    style={{ width: '18px', height: '18px', cursor: hasFunds ? 'not-allowed' : 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
                    Enable Crowdfunding 💰
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    {hasFunds 
                      ? "Locked: Contributions have already started." 
                      : "Fans can contribute any amount."}
                  </div>
                </div>
              </div>

              {hasFunds && (
                <div style={{ ...lockNoticeStyle, marginBottom: '1.25rem' }}>
                  <Lock size={12} />
                  <span>Funding active: Financial settings are locked.</span>
                </div>
              )}

              {/* Notes Section */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Notes (Optional)</label>
                <textarea 
                  value={editableData.notes || ''} 
                  onChange={(e) => handleEdit('notes', e.target.value)}
                  placeholder="Size, color, or a message..."
                  style={{ ...inputStyle, height: '80px', resize: 'none' }}
                />
              </div>
            </>
          )}
        </div>

        {/* FIXED FOOTER */}
        <div style={footerStyle}>
          <button 
            disabled={(!scrapedData && !isEditing && !error) || loading} 
            onClick={onContinue} 
            style={{ 
              ...submitButtonStyle, 
              backgroundColor: (scrapedData || isEditing || error) ? '#1e293b' : '#cbd5e1',
              opacity: loading ? 0.7 : 1,
              width: '100%' // Ensure button fills footer
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

const modalContentStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh', // Critical: Keeps modal within screen height
  display: 'flex',
  flexDirection: 'column', // Stack header -> body -> footer
  overflow: 'hidden', // Prevents container-level scrollbars
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  position: 'relative'
};

const scrollableBodyStyle = {
  padding: '1.25rem',
  overflowY: 'auto', // Only this section will scroll
  flex: 1, // Takes up all remaining space between header and footer
  display: 'flex',
  flexDirection: 'column'
};

const footerStyle = {
  padding: '1.25rem',
  borderTop: '1px solid #f1f5f9',
  backgroundColor: '#fff',
  position: 'sticky',
  bottom: 0,
  zIndex: 10
};


const headerStyle = { 
  padding: '1.25rem', 
  borderBottom: '1px solid #f1f5f9', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh', // Critical: Keeps modal from going off-screen
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Prevents container-level scrollbars
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

const modalHeaderStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const modalBodyStyle = {
  padding: '24px',
  overflowY: 'auto', // Enables scrolling only for the form content
  flex: 1            // Makes the body take up all available middle space
};

const modalFooterStyle = {
  padding: '16px 24px',
  borderTop: '1px solid #f1f5f9',
  backgroundColor: '#ffffff',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  position: 'sticky', // Pins the footer to the bottom
  bottom: 0,
  zIndex: 10
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
  paddingLeft: '10px' 
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
  marginBottom: '1.25rem',
  transition: 'all 0.2s ease'
};

const lockNoticeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '600',
  marginTop: '-8px',
  marginBottom: '1.25rem',
  padding: '8px 12px',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px'
};

const submitButtonStyle = { 
  width: '100%', 
  padding: '14px', 
  borderRadius: '12px', 
  color: 'white', 
  border: 'none', 
  fontSize: '15px',
  fontWeight: '700', 
  cursor: 'pointer'
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
  color: '#6366f1', 
  fontSize: '12px', 
  marginTop: '8px',
  fontWeight: '500'
};