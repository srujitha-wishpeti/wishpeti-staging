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

  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'GBP', symbol: '£' },
    { code: 'EUR', symbol: '€' },
  ];
  
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
                {editableData.image && (
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <img 
                        src={editableData.image} 
                        alt="Preview" 
                        style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} 
                        onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                        />
                    </div>
                )}
              </div>

              

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Price</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* NEW: Currency Dropdown */}
                    <select
                        value={editableData.currency || 'INR'}
                        onChange={(e) => handleEdit('currency', e.target.value)}
                        style={{ ...inputStyle, width: '80px', padding: '8px 4px' }}
                    >
                        {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                            {curr.code} ({curr.symbol})
                        </option>
                        ))}
                    </select>

                    {/* Price Input */}
                    <input 
                        type="text"
                        value={editableData.price} 
                        onChange={(e) => handleEdit('price', e.target.value)}
                        style={inputStyle}
                        placeholder="0.00"
                    />
                    </div>
                </div>
                
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Quantity</label>
                    <input 
                    type="number" 
                    min="1"
                    value={editableData.quantity || 1} 
                    onChange={(e) => handleEdit('quantity', e.target.value)}
                    style={inputStyle}
                    />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Notes for Fans (Optional)</label>
                <textarea 
                    value={editableData.notes || ''} 
                    onChange={(e) => handleEdit('notes', e.target.value)}
                    placeholder="e.g. Please buy the Blue color in Size Medium!"
                    style={{ 
                    ...inputStyle, 
                    height: '80px', 
                    resize: 'none', 
                    padding: '10px' 
                    }}
                />
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
                    {/* DYNAMIC VARIANT SECTION */}
                    {scrapedData && (scrapedData.variants?.sizes?.length > 0 || scrapedData.variants?.colors?.length > 0) && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        
                        {/* Only show Size if sizes were found */}
                        {scrapedData.variants?.sizes?.length > 0 && (
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Size</label>
                            <select 
                            value={editableData.selectedSize}
                            onChange={(e) => handleEdit('selectedSize', e.target.value)}
                            style={inputStyle}
                            >
                            <option value="">Select Size</option>
                            {scrapedData.variants.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        )}

                        {/* Only show Color if colors were found */}
                        {scrapedData.variants?.colors?.length > 0 && (
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Color</label>
                            <select 
                            value={editableData.selectedColor}
                            onChange={(e) => handleEdit('selectedColor', e.target.value)}
                            style={inputStyle}
                            >
                            <option value="">Select Color</option>
                            {scrapedData.variants.colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        )}
                    </div>
                    )}

                    {/* IMAGE PREVIEW: Added this to verify fetching worked */}
                    {editableData.image && (
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <img 
                        src={editableData.image} 
                        alt="Product Preview" 
                        style={{ maxHeight: '120px', borderRadius: '8px' }} 
                        onError={(e) => e.target.style.display = 'none'} // Hide if link is broken
                        />
                    </div>
                    )}
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