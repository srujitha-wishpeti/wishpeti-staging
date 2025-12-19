import React from 'react';
import { ShoppingBag, Trash2, ExternalLink } from 'lucide-react';

export default function WishlistItemCard({ item, onDelete, onAddToCart, isPublicView = false }) {
  
  /**
   * Properly formats prices into currency strings.
   * Defaults to INR (₹) if no currency is provided.
   */
  const formatPrice = (price, currency = 'INR') => {
    if (price === undefined || price === null || price === '') return 'Price TBD';
    
    // 1. Clean the price: Remove symbols and commas (common in INR strings like "7,999")
    const cleanPrice = typeof price === 'string' 
      ? price.replace(/[^\d.]/g, '') 
      : price;
    
    const numericPrice = parseFloat(cleanPrice);

    if (isNaN(numericPrice)) return 'Price TBD';

    try {
      // 2. Use 'en-IN' locale for proper Indian numbering (e.g., 1,00,000 instead of 100,000)
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        maximumFractionDigits: 0
      }).format(numericPrice);
    } catch (e) {
      // 3. Fallback to a simple string if formatting fails
      const symbol = currency === 'INR' ? '₹' : (currency || '₹');
      return `${symbol}${numericPrice.toLocaleString('en-IN')}`;
    }
  };

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
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300?text=No+Image';
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
          <span className="price-tag">
            {formatPrice(item.price, item.currency)}
          </span>
        </div>
        
        <h3 className="card-product-title">{item.title}</h3>
        
        <div className="card-footer-actions">
          <button 
            className="btn-main-action" 
            onClick={() => onAddToCart(item)}
          >
            <ShoppingBag size={16} />
            <span>{isPublicView ? 'Gift This' : 'Add to Cart'}</span>
          </button>
          
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-icon-link"
            title="View Original"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}