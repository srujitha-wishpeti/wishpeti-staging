import React from 'react';
import { ShoppingBag, Trash2, ExternalLink } from 'lucide-react';

export default function WishlistItemCard({ item, onDelete, onAddToCart }) {
  return (
    <div className="wishlist-item-card">
      <div className="wishlist-item-image-wrapper">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="wishlist-card-img" />
        ) : (
          <div className="wishlist-card-placeholder">🎁</div>
        )}
        {item.discount && <span className="wishlist-discount-badge">{item.discount}</span>}
      </div>

      <div className="wishlist-card-body">
        <div className="wishlist-card-header">
          <div className="wishlist-brand-info">
            {item.brand && <span className="wishlist-brand-name">{item.brand}</span>}
            <h3 className="wishlist-item-title">{item.title}</h3>
          </div>
          <button className="delete-btn" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className="wishlist-price-row">
          <span className="current-price">{item.price || 'N/A'}</span>
          {item.original_price && <span className="old-price">{item.original_price}</span>}
        </div>

        <div className="wishlist-store-tag">
          <span className="store-name">{item.store || 'Store'}</span>
          <span className={`stock-status ${item.availability?.toLowerCase().includes('in stock') ? 'in' : 'out'}`}>
            {item.availability || 'Check Store'}
          </span>
        </div>

        <div className="wishlist-card-actions">
          <button className="add-to-cart-btn" onClick={() => onAddToCart(item)}>
            <ShoppingBag size={16} /> Add to Cart
          </button>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="buy-now-btn">
             Buy <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}