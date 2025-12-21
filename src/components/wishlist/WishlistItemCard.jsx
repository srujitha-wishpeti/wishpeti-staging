import React from 'react';
import { ShoppingBag, Trash2, ExternalLink, Share2, Edit3 } from 'lucide-react';
import { formatPrice } from '../../utils/currency'; 

export default function WishlistItemCard({ 
  item, 
  isOwner,
  onDelete, 
  onAddToCart, 
  onEdit, 
  username, 
  currencySettings = { code: 'INR', rate: 1 } 
}) {
  
  const displayPrice = formatPrice(
    item.price, 
    currencySettings.code, 
    currencySettings.rate
  );

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

  const displayImage = item.image_url || item.image;

  return (
    <div className="unified-wishlist-card" id={`item-${item.id}`}>
      {/* 🚀 Price removed from here (Top) */}
      
      <div className="card-media-box">
        {displayImage ? (
          <img src={displayImage} alt={item.title} loading="lazy" />
        ) : (
          <div className="placeholder-box">🎁</div>
        )}
        
        <div className="item-actions-pill">
          {isOwner && (
            <button onClick={() => onEdit(item)} title="Edit">
              <Edit3 size={16} />
            </button>
          )}

          <a href={item.url} target="_blank" rel="noopener noreferrer" title="View Store">
            <ExternalLink size={16} />
          </a>

          <button onClick={handleShare} title="Share">
            <Share2 size={16} />
          </button>

          {isOwner && (
            <button className="delete-btn" onClick={() => onDelete(item.id)} title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="card-info-box">
        {/* 🚀 Price is now here at the bottom */}
        <div className="card-meta-top">
          <div className="brand-group">
            <span className="brand-tag">{item.brand || item.store || 'Store'}</span>
            <span className="category-tag">{item.category}</span>
          </div>
          <span className="item-price-footer">{displayPrice}</span>
        </div>
        
        <h3 className="card-product-title">{item.title}</h3>
        
        <div className="card-footer-actions">
          <button className="btn-main-action" onClick={() => onAddToCart(item)}>
            <ShoppingBag size={16} />
            <span>{!isOwner ? 'Gift This' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}