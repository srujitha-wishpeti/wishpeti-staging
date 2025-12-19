// components/ProductPreviewCard.jsx

export default function ProductPreviewCard({ product }) {
  if (!product) return null;

  return (
    <div style={{
      background: 'linear-gradient(to bottom right, #eef2ff, #faf5ff)',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '2px solid #c7d2fe',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Product Image */}
        <div style={{
          width: '6rem',
          height: '6rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: product.image?.length <= 5 ? '2.5rem' : '0',
          flexShrink: 0,
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {product.image?.length <= 5 ? (
            // Display emoji
            product.image
          ) : (
            // Display image URL
            <img 
              src={product.image} 
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // If image fails to load, show emoji
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML = '📦';
                e.currentTarget.parentElement.style.fontSize = '2.5rem';
              }}
            />
          )}
        </div>

        {/* Product Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'start', 
            justifyContent: 'space-between', 
            gap: '0.5rem', 
            marginBottom: '0.5rem' 
          }}>
            <h3 style={{
              fontWeight: 'bold',
              color: '#1f2937',
              fontSize: '0.875rem',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.title}
            </h3>
            {product.brand && (
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
                color: '#6b7280',
                flexShrink: 0,
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}>
                {product.brand}
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4f46e5' }}>
              {product.price}
            </span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  {product.originalPrice}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: '600'
                }}>
                  {product.discount}
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.875rem', 
              marginBottom: '0.75rem' 
            }}>
              <span style={{ color: '#eab308' }}>⭐</span>
              <span style={{ fontWeight: '600' }}>{product.rating}</span>
              {product.reviews && (
                <span style={{ color: '#6b7280' }}>
                  ({product.reviews.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {/* Variants Summary */}
          {product.variants && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {product.variants.colors && product.variants.colors.length > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                  {product.variants.colors.length} colors
                </span>
              )}
              {product.variants.sizes && product.variants.sizes.length > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                  {product.variants.sizes.length} sizes
                </span>
              )}
            </div>
          )}

          {/* Store & Availability */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{product.store}</span>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontWeight: '500',
              backgroundColor: product.availability?.includes('Stock') ? '#d1fae5' : '#fee2e2',
              color: product.availability?.includes('Stock') ? '#065f46' : '#991b1b'
            }}>
              {product.availability}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}