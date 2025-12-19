import { X, Edit2, Loader2 } from 'lucide-react';

export default function UrlInputForm({ 
  url, 
  onUrlChange, 
  scrapedData, 
  editableData, 
  setEditableData, 
  scraping, 
  error, 
  categories,
  selectedCategory,
  onCategoryChange,
  onContinue,
  onCancel,
  loading
}) {

  const handleEdit = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Add Wishlist Item</h2>
          <button onClick={onCancel} style={closeButtonStyle}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* URL Input Area - Always visible */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Product URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Paste product link here..."
              style={inputStyle}
            />
            {scraping && <div style={statusTextStyle}><Loader2 size={16} className="spin" /> Fetching details...</div>}
            {error && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</div>}
          </div>

          {/* ONLY show the editable form once we have scrapedData */}
          {scrapedData && (
            <div className="editable-section">
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Gift Title</label>
                <input 
                  value={editableData.title} 
                  onChange={(e) => handleEdit('title', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price</label>
                  <input 
                    value={editableData.price} 
                    onChange={(e) => handleEdit('price', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ width: '80px' }}>
                  <label style={labelStyle}>Quantity</label>
                  <input 
                    type="number" 
                    value={editableData.quantity} 
                    onChange={(e) => handleEdit('quantity', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Variant Selectors */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Size</label>
                  <select 
                    value={editableData.selectedSize}
                    onChange={(e) => handleEdit('selectedSize', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Size</option>
                    {scrapedData.variants?.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Color</label>
                  <select 
                    value={editableData.selectedColor}
                    onChange={(e) => handleEdit('selectedColor', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Color</option>
                    {scrapedData.variants?.colors?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button 
            disabled={!scrapedData || loading} 
            onClick={onContinue} 
            style={{ ...submitButtonStyle, backgroundColor: scrapedData ? '#4f46e5' : '#d1d5db' }}
          >
            {loading ? 'Saving...' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalContentStyle = { backgroundColor: 'white', borderRadius: '1rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' };
const headerStyle = { padding: '1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' };
const footerStyle = { padding: '1.25rem', borderTop: '1px solid #eee', display: 'flex', gap: '10px' };
const submitButtonStyle = { flex: 1, padding: '12px', borderRadius: '8px', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' };
const closeButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' };
const statusTextStyle = { display: 'flex', alignItems: 'center', gap: '5px', color: '#4f46e5', fontSize: '13px', marginTop: '8px' };