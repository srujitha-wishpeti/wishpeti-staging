import React from 'react';
import { ShoppingBag, Trash2, ExternalLink } from 'lucide-react';

export default function WishlistItemCard({ item, onDelete, onAddToCart, isPublicView = false }) {
  return (
    <div className="unified-wishlist-card">
      <div className="card-media-box">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} />
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
          <span className="brand-tag">{item.brand || 'Store'}</span>
          <span className="price-tag">{item.price?.toLocaleString()}</span>
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