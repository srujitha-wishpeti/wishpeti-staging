// components/OptionsSelectionPopup.jsx
import { Check, Loader2 } from 'lucide-react';

export default function OptionsSelectionPopup({ 
  product, 
  selections, 
  onSelectionChange,
  onCustomOptionChange,
  onBack,
  onConfirm,
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
      zIndex: 60,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        maxWidth: '36rem',
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
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          zIndex: 10
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            Select Your Options
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Choose size, color, and other preferences
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Product Summary */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{
                fontSize: product.image?.length <= 5 ? '2rem' : '0',
                width: '3rem',
                height: '3rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {product.image?.length <= 5 ? (
                  product.image
                ) : (
                  <img 
                    src={product.image} 
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '📦';
                      e.currentTarget.parentElement.style.fontSize = '2rem';
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.title}
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4f46e5', margin: 0 }}>
                  {product.price}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Colors */}
            {product.variants?.colors && product.variants.colors.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Color *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {product.variants.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onSelectionChange('color', color)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        borderRadius: '0.5rem',
                        border: `2px solid ${selections.color === color ? '#4f46e5' : '#d1d5db'}`,
                        backgroundColor: selections.color === color ? '#eef2ff' : 'white',
                        color: selections.color === color ? '#4f46e5' : '#374151',
                        fontWeight: selections.color === color ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {selections.color === color && <Check size={14} />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.variants?.sizes && product.variants.sizes.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Size *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => onSelectionChange('size', size)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        borderRadius: '0.5rem',
                        border: `2px solid ${selections.size === size ? '#4f46e5' : '#d1d5db'}`,
                        backgroundColor: selections.size === size ? '#eef2ff' : 'white',
                        color: selections.size === size ? '#4f46e5' : '#374151',
                        fontWeight: selections.size === size ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {selections.size === size && <Check size={14} />}
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {product.variants?.materials && product.variants.materials.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Material
                </label>
                <select
                  value={selections.material}
                  onChange={(e) => onSelectionChange('material', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {product.variants.materials.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Styles */}
            {product.variants?.styles && product.variants.styles.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Style
                </label>
                <select
                  value={selections.style}
                  onChange={(e) => onSelectionChange('style', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {product.variants.styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Options */}
            {product.customOptions && product.customOptions.length > 0 && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Additional Options
                </h4>
                {product.customOptions.map((option, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      {option.label}
                    </label>
                    {option.type === 'number' ? (
                      <input
                        type="number"
                        defaultValue={option.value || 1}
                        min={option.min}
                        max={option.max}
                        onChange={(e) => onCustomOptionChange(option.label, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <select
                        defaultValue={option.selected}
                        onChange={(e) => onCustomOptionChange(option.label, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {option.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            onClick={onBack}
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
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: loading ? '#d1d5db' : '#10b981',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Adding to Wishlist...
              </>
            ) : (
              <>
                <Check size={20} />
                Add to Wishlist
              </>
            )}
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