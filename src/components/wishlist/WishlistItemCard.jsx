import React from 'react';
import { ShoppingBag, Trash2, ExternalLink } from 'lucide-react';

export default function WishlistItemCard({ item, onDelete, onAddToCart, isPublicView = false }) {
  
  // FIX: Define the helper function INSIDE the component before the return
  const formatPrice = (price, currency) => {
    if (!price) return 'Price TBD';
    
    // Remove any existing currency symbols from the string to avoid errors
    const cleanPrice = typeof price === 'string' ? price.replace(/[^\d.]/g, '') : price;
    const numericPrice = parseFloat(cleanPrice);

    if (isNaN(numericPrice)) return 'Price TBD';

    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        maximumFractionDigits: 0
      }).format(numericPrice);
    } catch (e) {
      // Fallback if currency code is invalid
      return `${currency || '₹'} ${numericPrice}`;
    }
  };

  // Handle image keys (image_url vs image)
  const displayImage = item.image_url || item.image;

  return (
    <div className="unified-wishlist-card">
      <div className="card-media-box">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={item.title} 
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
            }}
          />
        ) : (
          <div className="placeholder-box">🎁</div>
        )}
        {!isPublicView && (
          <button className="card-delete-trigger" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="card-info-box">
        <div className="card-meta-top">
          <span className="brand-tag">{item.brand || item.store || 'Store'}</span>
          {/* Use the helper function here */}
          <span className="price-tag">
            {formatPrice(item.price, item.currency)}
          </span>
        </div>
        
        <h3 className="card-product-title">{item.title}</h3>
        
        <div className="card-footer-actions">
          <button className="btn-main-action" onClick={() => onAddToCart(item)}>
            <ShoppingBag size={16} />
            <span>{isPublicView ? 'Gift' : 'Add to Cart'}</span>
          </button>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-icon-link">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}