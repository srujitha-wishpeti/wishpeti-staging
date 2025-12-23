import React from 'react';
import { ShoppingBag, Trash2, ExternalLink, Share2, Edit3, Users, CheckCircle, Lock } from 'lucide-react';
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
  
  // Logic for "Claimed" status
  const isClaimed = item.status === 'claimed' || item.status === 'purchased' || (item.quantity !== null && item.quantity <= 0);

  // Math for progress bar
  const progressPercent = Math.round((item.amount_raised / item.price) * 100) || 0;
  const clampedPercentage = Math.min(progressPercent, 100);
  const isFullyFunded = raisedAmount >= goalAmount;

  // Check if item has any contributions (prevents 409 Conflict error on delete)
  const hasContributions = raisedAmount > 0;

  const isLocked = hasContributions || isClaimed;
  const displayPrice = formatPrice(item.price, currencySettings.code, currencySettings.rate);
  const displayRaised = formatPrice(raisedAmount, currencySettings.code, currencySettings.rate);
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
    <div 
      className={`unified-wishlist-card ${isCrowdfund ? 'crowdfund-style' : ''} ${isClaimed ? 'item-claimed' : ''}`} 
      id={`item-${item.id}`}
    >
      
      {/* MEDIA SECTION */}
      <div className="card-media-box">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={item.title} 
            loading="lazy" 
            style={{ filter: isClaimed ? 'grayscale(1) opacity(0.6)' : 'none' }} 
          />
        ) : (
          <div className="placeholder-box">🎁</div>
        )}

        {/* GIFTED BADGE */}
        {isClaimed && !isCrowdfund && (
            <div className="gifted-overlay-badge" style={giftedBadgeStyle}>
                <CheckCircle size={14} style={{ marginRight: '4px' }} />
                <span>GIFTED</span>
            </div>
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

          {/* DYNAMIC DELETE ACTION: Only show if 0 funds raised */}
          {isOwner && onDelete && (
            isLocked ? (
              <div className="locked-action" title="Funded items cannot be deleted" style={lockContainerStyle}>
                <Lock size={14} />
              </div>
            ) : (
              <button className="delete-btn" onClick={() => onDelete(item.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            )
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
        
        <h3 className="card-product-title" style={{ color: isClaimed ? '#94a3b8' : '#1e293b' }}>
            {item.title}
        </h3>

        {/* PROGRESS BAR SECTION */}
        {isCrowdfund && (
          <div className="crowdfund-progress-section">
            <div className="progress-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: isFullyFunded ? '#22c55e' : '#1e293b' }}>
                    {clampedPercentage}% Funded
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                    {displayRaised}
                </span>
            </div>
            
            <div className="progress-track" style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${clampedPercentage}%`, 
                  height: '100%', 
                  backgroundColor: isFullyFunded ? '#22c55e' : '#6366f1',
                  transition: 'width 0.5s ease-in-out'
                }} 
              />
            </div>
          </div>
        )}
        
        <div className="card-footer-actions">
          <button 
            className={`btn-main-action ${isCrowdfund ? 'crowdfund-btn' : ''} ${isClaimed ? 'btn-disabled' : ''}`} 
            onClick={() => !isClaimed && onAddToCart(item)}
            disabled={isClaimed && !isOwner}
            style={{ 
              backgroundColor: isClaimed && !isOwner ? '#f1f5f9' : '',
              color: isClaimed && !isOwner ? '#94a3b8' : '',
              border: isClaimed && !isOwner ? '1px solid #e2e8f0' : '',
              cursor: isClaimed && !isOwner ? 'not-allowed' : 'pointer'
            }}
          >
            {!isClaimed && <ShoppingBag size={16} />}
            <span>
              {isCrowdfund 
                ? (isFullyFunded && !isOwner ? 'Fully Funded' : (isOwner ? 'View Stats' : 'Contribute')) 
                : (isClaimed ? 'Already Gifted! 🎁' : (!isOwner ? 'Gift This' : 'Add to Cart'))}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const badgeContainerStyle = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  display: 'flex',
  alignItems: 'center',
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

const lockContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  color: '#94a3b8',
  opacity: 0.6,
  cursor: 'help'
};

const giftedBadgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#10b981', 
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.05em',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    zIndex: 11
};