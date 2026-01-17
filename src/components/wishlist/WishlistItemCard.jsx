import React, { useState } from 'react';
import { ShoppingBag, Trash2, ExternalLink, Share2, Edit3, Lock, Star, ArrowUp, CheckCircle, X, Sparkles } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { supabase } from '../../services/supabaseClient';
import SpotlightPortal from '../ui/SpotlightPortal';
import { useToast} from '.././../context/ToastContext';

// --- SUB-COMPONENT: CARD CONTENT ---
const CardInnerContent = ({ 
  item, 
  isOwner, 
  isWonItem, // Added this prop
  isClaimed, 
  isCrowdfund, 
  displayImage, 
  currentPriority, 
  displayMainPrice, 
  qty, 
  isFullyFunded, 
  clampedPercentage, 
  displayRaised, 
  onEdit, 
  handleShare, 
  isLocked, 
  onDelete, 
  handlePriorityChange,
  onAddToCart,
  priorities,
  username
}) => (
  <div className={`unified-wishlist-card ${isCrowdfund ? 'crowdfund-style' : ''} ${isClaimed ? 'item-claimed' : ''}`} style={{ background: 'white', height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
    <div className="card-media-box" style={{ 
      position: 'relative', 
      width: '100%',
      aspectRatio: '1 / 1',
      backgroundColor: '#f8fafc',
      overflow: 'hidden'
    }}>
      {displayImage ? (
        <img 
          src={displayImage} 
          alt={item.title} 
          loading="lazy" 
          style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',
              padding: '12px',
              filter: isClaimed ? 'grayscale(1) opacity(0.6)' : 'none' 
          }}
        />
      ) : (
        <div className="placeholder-box" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>🎁</div>
      )}

      {item.is_giveaway && !isClaimed && (
        <div style={giveawayBadgeStyle}>
          <Sparkles size={12} style={{ marginRight: '4px' }} />
          <span>GIVEAWAY</span>
        </div>
      )}

      {!isClaimed && item.priority_level < 3 && (
        <div style={{ ...priorityBadgeStyle, backgroundColor: currentPriority.color, fontSize: '9px', padding: '2px 6px' }}>
          {currentPriority.label}
        </div>
      )}

      {isClaimed && (
        <div style={giftedBadgeStyle}>
          <CheckCircle size={12} style={{ marginRight: '4px' }} />
          <span>GIFTED</span>
        </div>
      )}

      <div className="item-actions-pill" style={{ opacity: 0.9 }} onClick={(e) => e.stopPropagation()}>
        {isOwner && onEdit && (
          <button onClick={() => onEdit(item)} title="Edit"><Edit3 size={16} /></button>
        )}
        <a href={item.url} target="_blank" rel="noopener noreferrer" title="View Store">
          <ExternalLink size={16} />
        </a>
        <button onClick={handleShare} title="Share"><Share2 size={16} /></button>
        {isOwner && onDelete && (
          isLocked ? (
            <div style={lockContainerStyle} title="Funded items cannot be deleted"><Lock size={14} /></div>
          ) : (
            <button className="delete-btn" onClick={() => onDelete(item.id)}><Trash2 size={16} /></button>
          )
        )}
      </div>
    </div>

    <div className="card-info-box" style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
          {item.brand || item.store || 'Store'}
          {qty > 1  && (
              <span style={qtyTagStyle}>Qty {qty}</span>
            )}
        </span>
        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{displayMainPrice}</span>
      </div>
      
      <h3 style={{ 
          color: isClaimed ? '#94a3b8' : '#1e293b', 
          fontSize: '14px', 
          fontWeight: '600',
          lineHeight: '1.3',
          margin: '0 0 8px 0',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '36px' 
      }}>
        {item.title}
      </h3>

      {isOwner && !isClaimed && (
        <div style={{ marginTop: '10px' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select 
              value={item.priority_level || 3} 
              onChange={handlePriorityChange}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '8px',
                cursor: 'pointer',
                appearance: 'none',
                backgroundColor: `${currentPriority.color}10`,
                color: currentPriority.color,
                border: `1px solid ${currentPriority.color}40`,
                outline: 'none',
                textAlign: 'center'
              }}
            >
              {priorities.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label} Priority
                </option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', fontSize: '8px', color: currentPriority.color }}>▼</div>
          </div>
        </div>
      )}

      {isCrowdfund && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
              <span style={{ fontWeight: '800', color: '#6366f1' }}>{clampedPercentage}% Raised</span>
              <span style={{ color: '#94a3b8' }}>{displayRaised}</span>
          </div>
          <div style={{ ...progressTrackStyle, height: '6px' }}>
            <div style={{ ...progressFillStyle, width: `${clampedPercentage}%`, backgroundColor: '#6366f1' }} />
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '16px' }}>
        <button 
          className={`btn-main-action ${isClaimed ? 'btn-disabled' : ''}`} 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (isClaimed && !isOwner) return;
            if (isOwner) {
              if (isCrowdfund) {
                // For crowdfunds, we trigger the modal (Manage Givers)
                onAddToCart(item);
              } else {
                // For standard items, we go to the details page
                const targetUser = username || item.username || 'user';
                window.location.href = `/${targetUser}/item/${item.id}`;
              }
              return;
            }
            onAddToCart(item); 
          }}
          disabled={isClaimed && !isOwner}
          style={mainBtnStyle(isClaimed && !isOwner)}
        >
          {!isClaimed && !isWonItem && <ShoppingBag size={16} style={{marginRight: '8px'}} />}
        <span>
          {isOwner ? (
            isCrowdfund ? (
              isFullyFunded 
                ? (item.is_giveaway ? 'Pick Winner & Get Link' : 'Goal Met - Manage') 
                : 'Manage Givers'
            ) : 'View Details'
          ) : (
            isWonItem ? 'You Won! 🎁' : 
            item.winner_id ? 'Giveaway Ended' : 
            item.is_giveaway ? (isFullyFunded ? 'Goal Met!' : 'Enter Giveaway') : 
            isCrowdfund ? (isFullyFunded ? 'Fully Funded' : 'Contribute') :
            (isClaimed ? 'Claimed 🎁' : 'Gift This')
          )}
        </span>
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function WishlistItemCard({ 
  item, 
  isOwner,
  isWonItem, // Received from WishlistPage
  onDelete, 
  onAddToCart, 
  onEdit, 
  username, 
  onUpdate,
  currencySettings = { code: 'INR', rate: 1, symbol: '₹' } 
}) {
  const [isSpotlight, setIsSpotlight] = useState(false);
  
  const isCrowdfund = item.is_crowdfund === true;
  const raisedAmount = item.amount_raised || 0;
  const isClaimed = item.status === 'claimed' || item.status === 'purchased' || (item.quantity !== null && item.quantity <= 0);

  const unitPrice = item.price || 0;
  const qty = item.quantity || 1;
  const goalAmount = unitPrice * qty;

  const progressPercent = Math.round((raisedAmount / goalAmount) * 100) || 0;
  const clampedPercentage = Math.min(progressPercent, 100);
  const isFullyFunded = raisedAmount >= goalAmount;

  const hasContributions = raisedAmount > 0;
  const isLocked = hasContributions || isClaimed;

  const { formatPrice } = useCurrency();
  
  const priorities = [
    { value: 1, label: 'High', color: '#ef4444', icon: <ArrowUp size={12} /> },
    { value: 2, label: 'Medium', color: '#f59e0b', icon: <Star size={12} /> },
    { value: 3, label: 'Standard', color: '#94a3b8', icon: null }
  ];
  const currentPriority = priorities.find(p => p.value === (item.priority_level || 3));

  const displayMainPrice = isCrowdfund 
    ? formatPrice(goalAmount, currencySettings.code, currencySettings.rate)
    : formatPrice(unitPrice, currencySettings.code, currencySettings.rate);

  const displayRaised = formatPrice(raisedAmount, currencySettings.code, currencySettings.rate);
  const displayImage = item.image_url || item.image;

  const handlePriorityChange = async (e) => {
    e.stopPropagation();
    const newLevel = parseInt(e.target.value);
    const { error } = await supabase
      .from('wishlist_items')
      .update({ priority_level: newLevel })
      .eq('id', item.id);

    if (!error && onUpdate) onUpdate(); 
  };

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
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard! 📋");
      } catch (err) {}
    }
  };

  const contentProps = {
    item, isOwner, isWonItem, isClaimed, isCrowdfund, isGiveaway: item.is_giveaway, displayImage, currentPriority,
    displayMainPrice, qty, isFullyFunded, clampedPercentage, displayRaised,
    onEdit, handleShare, isLocked, onDelete, handlePriorityChange, onAddToCart, priorities, username
  };

  return (
    <>
      <div onClick={() => setIsSpotlight(true)} style={{ cursor: 'pointer', height: '100%' }}>
        <CardInnerContent {...contentProps} />
      </div>

      {isSpotlight && (
        <SpotlightPortal onClose={() => setIsSpotlight(false)}>
          <div style={{ position: 'relative', width: '100%' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSpotlight(false); }} 
              style={closePortalBtnStyle}
            >
              <X size={24} color="white" />
            </button>
            <div style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '24px' }}>
              <CardInnerContent {...contentProps} inPortal={true} />
            </div>
          </div>
        </SpotlightPortal>
      )}
    </>
  );
}

// --- STYLES ---
const priorityBadgeStyle = {
  position: 'absolute', top: '10px', left: '10px',
  display: 'flex', alignItems: 'center', color: 'white',
  padding: '4px 8px', borderRadius: '6px', fontSize: '10px',
  fontWeight: '800', textTransform: 'uppercase', zIndex: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const giftedBadgeStyle = {
  position: 'absolute', top: '10px', right: '10px',
  display: 'flex', alignItems: 'center', backgroundColor: '#10b981',
  color: 'white', padding: '4px 10px', borderRadius: '20px',
  fontSize: '10px', fontWeight: '800', zIndex: 11,
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
};

const mainBtnStyle = (disabled) => ({
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '12px', borderRadius: '12px', fontWeight: '700', border: 'none',
  backgroundColor: disabled ? '#f1f5f9' : '#1e293b',
  color: disabled ? '#94a3b8' : 'white',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease'
});

const giveawayBadgeStyle = {
  position: 'absolute', top: '10px', left: '10px',
  backgroundColor: '#6366f1', color: 'white',
  padding: '4px 8px', borderRadius: '6px', fontSize: '9px', 
  fontWeight: '800', zIndex: 10, display: 'flex', alignItems: 'center'
};

const prioritySelectStyle = (color) => ({
  width: '100%', padding: '6px', borderRadius: '6px', fontSize: '12px',
  fontWeight: '600', border: `1px solid ${color}`, backgroundColor: 'white', cursor: 'pointer'
});

const tinyLabelStyle = { fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' };
const progressTrackStyle = { height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' };
const progressFillStyle = { height: '100%', transition: 'width 0.5s ease-in-out' };
const qtyTagStyle = { backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginLeft: '6px' };
const lockContainerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: '#94a3b8' };
const closePortalBtnStyle = { position: 'absolute', top: '-45px', right: '0', background: 'none', border: 'none', cursor: 'pointer' };