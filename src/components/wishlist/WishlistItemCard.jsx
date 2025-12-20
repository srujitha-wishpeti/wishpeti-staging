import React from 'react';
import { ShoppingBag, Trash2, ExternalLink, Share2, Edit3 } from 'lucide-react';

export default function WishlistItemCard({ item, onDelete, onAddToCart, onEdit, username, isPublicView = false }) {
  
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/wishlist/${username}?item=${item.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Gift me this! 🎁`,
          text: `I'd love to receive "${item.title}" from my WishPeti wishlist!`,
          url: shareUrl,
        });
      } catch (err) { console.log('Share cancelled'); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard! 📋");
    }
  };

  const formatPrice = (price, currency = 'INR') => {
    if (price === undefined || price === null || price === '') return 'Price TBD';
    const cleanPrice = typeof price === 'string' ? price.replace(/[^\d.]/g, '') : price;
    const numericPrice = parseFloat(cleanPrice);
    if (isNaN(numericPrice)) return 'Price TBD';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0
    }).format(numericPrice);
  };

  const displayImage = item.image_url || item.image;

  return (
    <div className="unified-wishlist-card" id={`item-${item.id}`}>
      <div className="card-media-box">
        {displayImage ? (
          <img src={displayImage} alt={item.title} loading="lazy" />
        ) : (
          <div className="placeholder-box">🎁</div>
        )}
        
        {/* 🚀 THE NEW FLOATING PILL */}
        <div className="item-actions-pill">
          {!isPublicView && (
            <button onClick={() => onEdit(item)} title="Edit">
              <Edit3 size={16} />
            </button>
          )}

          {/* Up Arrow (External Link) moved here for a cleaner look */}
          <a href={item.url} target="_blank" rel="noopener noreferrer" title="View Store">
            <ExternalLink size={16} />
          </a>

          <button onClick={handleShare} title="Share">
            <Share2 size={16} />
          </button>

          {!isPublicView && (
            <button className="delete-btn" onClick={() => onDelete(item.id)} title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="card-info-box">
        <div className="card-meta-top">
          <span className="brand-tag">{item.brand || item.store || 'Store'}</span>
          <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
        </div>
        
        <h3 className="card-product-title">{item.title}</h3>
        
        <div className="card-footer-actions">
          <button className="btn-main-action" onClick={() => onAddToCart(item)}>
            <ShoppingBag size={16} />
            <span>{isPublicView ? 'Gift This' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}