import { X, Loader2 } from 'lucide-react';

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
  loading,
  isEditing,
  currencySymbol, // 🚀 Passed from parent
  currencyCode    // 🚀 Passed from parent
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                {isEditing ? 'Edit Wishlist Item' : 'Add Wishlist Item'}
            </h2>
            <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  onCancel(); 
                }} 
                style={closeButtonStyle}
            >
                <X size={20} />
            </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* URL Input Area */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Product URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Paste product link here..."
              disabled={isEditing} 
              style={{ ...inputStyle, backgroundColor: isEditing ? '#f9fafb' : '#ffffff' }}
            />
            {scraping && <div style={statusTextStyle}><Loader2 size={16} className="spin" /> Fetching details...</div>}
            {error && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</div>}
          </div>

          {(scrapedData || isEditing) && (
            <div className="editable-section">
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Gift Title</label>
                <input 
                  value={editableData.title} 
                  onChange={(e) => handleEdit('title', e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Image Preview */}
              {editableData.image && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img 
                      src={editableData.image} 
                      alt="Preview" 
                      style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }} 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                    />
                </div>
              )}

              {/* Price and Quantity Group */}
              {/* Price and Quantity Group */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                
                {/* Price Input Wrapper */}
                <div style={{ flex: 3 }}>
                    <label style={labelStyle}>Price</label>
                    <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#fff',
                    height: '48px',
                    position: 'relative',
                    overflow: 'hidden'
                    }}>
                    {/* Currency Indicator (Static Label) */}
                    <div style={{
                        padding: '0 12px',
                        backgroundColor: '#f9fafb',
                        borderRight: '1px solid #ddd',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#4b5563',
                        fontSize: '14px',
                        fontWeight: '600',
                        minWidth: '80px',
                        justifyContent: 'center'
                    }}>
                        {currencyCode || 'INR'}
                    </div>

                    {/* Actual Editable Input */}
                    <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                        <span style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        pointerEvents: 'none' // Ensures clicks go through to the input
                        }}>
                        {currencySymbol}
                        </span>
                        <input 
                        type="text"
                        value={editableData.price} 
                        onChange={(e) => handleEdit('price', e.target.value)}
                        placeholder="0.00"
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            padding: '0 12px 0 28px', // Extra left padding to clear the symbol
                            border: 'none', 
                            outline: 'none',
                            fontSize: '16px',
                            backgroundColor: 'transparent',
                            display: 'block' // Ensures it takes up the space
                        }}
                        />
                    </div>
                    </div>
                </div>

                {/* Quantity Wrapper */}
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Quantity</label>
                    <input 
                    type="number" 
                    min="1"
                    value={editableData.quantity || 1} 
                    onChange={(e) => handleEdit('quantity', e.target.value)}
                    style={{ 
                        width: '100%', 
                        height: '48px', 
                        padding: '0 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                    />
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '-10px', marginBottom: '1.5rem' }}>
                Converted automatically based on site currency settings.
              </p>
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

              {/* Dynamic Variants */}
              {(scrapedData?.variants?.sizes?.length > 0 || scrapedData?.variants?.colors?.length > 0) && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button 
            disabled={(!scrapedData && !isEditing) || loading} 
            onClick={onContinue} 
            style={{ 
              ...submitButtonStyle, 
              backgroundColor: (scrapedData || isEditing) ? '#4f46e5' : '#d1d5db' 
            }}
          >
            {loading ? 'Saving...' : (isEditing ? 'Save Item' : 'Add to Wishlist')}
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
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#ffffff', color: '#111827', WebkitTextFillColor: '#111827', fontSize: '16px', appearance: 'none' };
const footerStyle = { padding: '1.25rem', borderTop: '1px solid #eee', display: 'flex', gap: '10px' };
const submitButtonStyle = { flex: 1, padding: '12px', borderRadius: '8px', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' };
const closeButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' };
const statusTextStyle = { display: 'flex', alignItems: 'center', gap: '5px', color: '#4f46e5', fontSize: '13px', marginTop: '8px' };