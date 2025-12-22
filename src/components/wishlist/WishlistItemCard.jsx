import React from 'react';
import { ShoppingBag, Trash2, ExternalLink, Share2, Edit3, Users } from 'lucide-react';
import { formatPrice } from '../../utils/currency'; 

export default function WishlistItemCard({ 
  item, 
  isOwner,
  onDelete, 
  onAddToCart, 
  onEdit, // Ensure this is passed from the parent!
  username, 
  currencySettings = { code: 'INR', rate: 1 } 
}) {
  
  const isCrowdfund = item.is_crowdfund === true;
  const goalAmount = item.price;
  const raisedAmount = item.amount_raised || 0;
  const progressPercent = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100);

  const displayPrice = formatPrice(
    item.price, 
    currencySettings.code, 
    currencySettings.rate
  );

  const displayRaised = formatPrice(
    raisedAmount,
    currencySettings.code,
    currencySettings.rate
  );

  // Fix: Check all possible image fields
  const displayImage = item.image_url || item.image;

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

  return (
    <div className={`unified-wishlist-card ${isCrowdfund ? 'crowdfund-style' : ''}`} id={`item-${item.id}`}>
      
      <div className="card-media-box">
        {displayImage ? (
          <img src={displayImage} alt={item.title} loading="lazy" />
        ) : (
          <div className="placeholder-box">🎁</div>
        )}

        {isCrowdfund && (
          <div className="crowdfund-badge">
            <Users size={12} />
            <span>Crowdfund Goal</span>
          </div>
        )}
        
        <div className="item-actions-pill">
          {/* Fix: Added optional chaining to prevent crash if onEdit is missing */}
          {isOwner && onEdit && (
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

          {isOwner && onDelete && (
            <button className="delete-btn" onClick={() => onDelete(item.id)} title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="card-info-box">
        <div className="card-meta-top">
          <div className="brand-group">
            <span className="brand-tag">{item.brand || item.store || 'Store'}</span>
            <span className="category-tag">{item.category}</span>
          </div>
          <span className="item-price-footer">{displayPrice}</span>
        </div>
        
        <h3 className="card-product-title">{item.title}</h3>

        {isCrowdfund && (
          <div className="crowdfund-progress-section">
            <div className="progress-stats">
              <span className="percent-text">{progressPercent}% Funded</span>
              <span className="raised-text">{displayRaised} raised</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}
        
        <div className="card-footer-actions">
          <button 
            className={`btn-main-action ${isCrowdfund ? 'crowdfund-btn' : ''}`} 
            onClick={() => onAddToCart(item)}
          >
            <ShoppingBag size={16} />
            <span>
              {/* Logic Fix: Owners see "Edit/Add", Fans see "Gift/Contribute" */}
              {isCrowdfund 
                ? (isOwner ? 'View Contributions' : 'Contribute') 
                : (!isOwner ? 'Gift This' : 'Add to Cart')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}