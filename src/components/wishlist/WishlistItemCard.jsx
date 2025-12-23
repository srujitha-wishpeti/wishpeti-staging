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
  isHighlighted,
  currencySettings = { code: 'INR', rate: 1, symbol: '₹' } 
}) {
  
  const isCrowdfund = item.is_crowdfund === true;
  const raisedAmount = item.amount_raised || 0;
  
  // Logic for "Claimed" status
  const isClaimed = item.status === 'claimed' || item.status === 'purchased' || (item.quantity !== null && item.quantity <= 0);

  // NEW: Calculate dynamic goal based on Unit Price * Quantity
  const unitPrice = item.price || 0;
  const qty = item.quantity || 1;
  const goalAmount = unitPrice * qty;

  // Math for progress bar
  const progressPercent = Math.round((raisedAmount / goalAmount) * 100) || 0;
  const clampedPercentage = Math.min(progressPercent, 100);
  const isFullyFunded = raisedAmount >= goalAmount;

  // Check if item has any contributions (prevents 409 Conflict error on delete)
  const hasContributions = raisedAmount > 0;
  const isLocked = hasContributions || isClaimed;

  // DISPLAY VALUES
  // For Crowdfunds, we show the Total Goal price. For normal items, we show Unit Price.
  const displayMainPrice = isCrowdfund 
    ? formatPrice(goalAmount, currencySettings.code, currencySettings.rate)
    : formatPrice(unitPrice, currencySettings.code, currencySettings.rate);

  const displayRaised = formatPrice(raisedAmount, currencySettings.code, currencySettings.rate);
  const displayImage = item.image_url || item.image;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/${username}/item/${item.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Gift me this! 🎁`,
          text: `I'd love to receive "${item.title}" from my wishlist!`,
          url: shareUrl,
        });
      } catch (err) { /* User cancelled or share failed */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Tip: You could replace this alert with a temporary toast notification
        alert("Link copied to clipboard! 📋");
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <div 
      className={`unified-wishlist-card 
        ${isCrowdfund ? 'crowdfund-style' : ''} 
        ${isClaimed ? 'item-claimed' : ''} 
        ${isHighlighted ? 'card-is-spotlighted' : ''}`} // <--- ADD THIS
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

          {isOwner && onDelete && (
            isLocked ? (
              <div className="locked-action" title="Funded or claimed items cannot be deleted" style={lockContainerStyle}>
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
        <div className="card-meta-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="brand-group">
            <span className="brand-tag">{item.brand || item.store || 'Store'}</span>
            {qty > 1 && <span className="qty-tag" style={qtyTagStyle}>Qty: {qty}</span>}
          </div>
          <span className="item-price-footer" style={{ fontWeight: '800', color: '#1e293b' }}>
            {displayMainPrice}
          </span>
        </div>
        
        <h3 className="card-product-title" style={{ color: isClaimed ? '#94a3b8' : '#1e293b', marginTop: '8px' }}>
            {item.title}
        </h3>

        {/* PROGRESS BAR SECTION */}
        {isCrowdfund && (
          <div className="crowdfund-progress-section" style={{ marginTop: '12px' }}>
            <div className="progress-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: isFullyFunded ? '#22c55e' : '#6366f1' }}>
                    {clampedPercentage}% Raised
                </span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
                    {displayRaised} of {displayMainPrice}
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
        
        <div className="card-footer-actions" style={{ marginTop: '16px' }}>
          <button 
            className={`btn-main-action ${isCrowdfund ? 'crowdfund-btn' : ''} ${isClaimed ? 'btn-disabled' : ''}`} 
            onClick={() => !isClaimed && onAddToCart(item)}
            disabled={isClaimed && !isOwner}
            style={{ 
              backgroundColor: isClaimed && !isOwner ? '#f1f5f9' : '',
              color: isClaimed && !isOwner ? '#94a3b8' : '',
              border: isClaimed && !isOwner ? '1px solid #e2e8f0' : '',
              cursor: isClaimed && !isOwner ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {!isClaimed && <ShoppingBag size={16} />}
            <span>
              {isCrowdfund 
                ? (isFullyFunded && !isOwner ? 'Fully Funded' : (isOwner ? 'View Contributions' : 'Contribute')) 
                : (isClaimed ? 'Already Gifted! 🎁' : (!isOwner ? 'Gift This' : 'Add to Cart'))}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const qtyTagStyle = {
  backgroundColor: '#f1f5f9',
  color: '#475569',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: '700',
  marginLeft: '6px',
  textTransform: 'uppercase'
};

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