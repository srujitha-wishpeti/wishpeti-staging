import React from 'react';
import { ShoppingBag, Trash2, ExternalLink, Share2, Edit3, Users } from 'lucide-react';
import { formatPrice } from '../../utils/currency'; 

export default function WishlistItemCard({ 
  item, 
  isOwner,
  onDelete, 
  onAddToCart, 
  onEdit, 
  username, 
  currencySettings = { code: 'INR', rate: 1, symbol: '₹' } 
}) {
  
  const isCrowdfund = item.is_crowdfund === true;
  const goalAmount = item.price;
  const raisedAmount = item.amount_raised || 0;
  
  // Calculate percentage (max 100)
  const progressPercent = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100);
  const isFullyFunded = raisedAmount >= goalAmount;

  // Use the formatting utility for consistent currency display
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
      
      {/* MEDIA SECTION */}
      <div className="card-media-box">
        {displayImage ? (
          <img src={displayImage} alt={item.title} loading="lazy" />
        ) : (
          <div className="placeholder-box">🎁</div>
        )}

        {isCrowdfund && (
            <div className="crowdfund-badge" style={badgeContainerStyle}>
                <Users size={12} style={{ marginRight: '4px' }} />
                <span style={{ lineHeight: '1' }}>{isFullyFunded ? 'Goal Met!' : 'Crowdfund Goal'}</span>
            </div>
        )}
        
        <div className="item-actions-pill">
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

      {/* INFO SECTION */}
      <div className="card-info-box">
        <div className="card-meta-top">
          <div className="brand-group">
            <span className="brand-tag">{item.brand || item.store || 'Store'}</span>
            <span className="category-tag">{item.category}</span>
          </div>
          <span className="item-price-footer">{displayPrice}</span>
        </div>
        
        <h3 className="card-product-title">{item.title}</h3>

        {/* PROGRESS BAR SECTION */}
        {isCrowdfund && (
          <div className="crowdfund-progress-section">
            <div className="progress-stats" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline', // Keeps text level
                marginBottom: '4px' 
                }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                    {progressPercent}% Funded
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                    {displayRaised}
                </span>
            </div>
            
            <div className="progress-track" style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  backgroundColor: progressPercent >= 100 ? '#22c55e' : '#6366f1',
                  transition: 'width 0.5s ease-in-out'
                }} 
              />
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
              Target: {displayPrice}
            </div>
          </div>
        )}
        
        <div className="card-footer-actions">
          <button 
            className={`btn-main-action ${isCrowdfund ? 'crowdfund-btn' : ''}`} 
            onClick={() => onAddToCart(item)}
            disabled={isCrowdfund && isFullyFunded && !isOwner}
            style={{ 
              opacity: (isCrowdfund && isFullyFunded && !isOwner) ? 0.6 : 1,
              cursor: (isCrowdfund && isFullyFunded && !isOwner) ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingBag size={16} />
            <span>
              {isCrowdfund 
                ? (isFullyFunded && !isOwner ? 'Fully Funded' : (isOwner ? 'View Stats' : 'Contribute')) 
                : (!isOwner ? 'Gift This' : 'Add to Cart')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
const badgeContainerStyle = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  display: 'flex',            // Enable Flexbox
  alignItems: 'center',       // Center icon and text vertically
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '700',
  color: '#475569',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  backdropFilter: 'blur(4px)',
  zIndex: 10
};