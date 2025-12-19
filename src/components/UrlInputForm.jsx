// components/UrlInputForm.jsx
import { X, Edit2, Loader2 } from 'lucide-react';
import ProductPreviewCard from './ProductPreviewCard';

export default function UrlInputForm({ 
  url, 
  onUrlChange, 
  scrapedData, 
  scraping, 
  error, 
  categories,
  selectedCategory,
  onCategoryChange,
  onContinue,
  onCancel,
  loading
}) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            Add to Wishlist
          </h2>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* URL Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Product URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Paste link from Amazon, Flipkart, Myntra, etc."
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.75rem',
                outline: 'none',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            
            {/* Loading State */}
            {scraping && (
              <div style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#4f46e5'
              }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Fetching product details...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}
          </div>

          {/* Product Preview */}
          <ProductPreviewCard product={scrapedData} />

          {/* Category Selection */}
          {scrapedData && categories && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Category (Optional)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  outline: 'none',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Auto-detect from product</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          borderBottomLeftRadius: '1rem',
          borderBottomRightRadius: '1rem'
        }}>
          <button
            onClick={onContinue}
            disabled={loading || !scrapedData}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: scrapedData ? '#4f46e5' : '#d1d5db',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: scrapedData ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (scrapedData) e.currentTarget.style.backgroundColor = '#4338ca';
            }}
            onMouseOut={(e) => {
              if (scrapedData) e.currentTarget.style.backgroundColor = '#4f46e5';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Adding...
              </>
            ) : (
              <>
                <Edit2 size={20} />
                Continue
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              border: '2px solid #d1d5db',
              color: '#374151',
              fontWeight: '600',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}