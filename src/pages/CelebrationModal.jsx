import React, { useEffect, useRef } from 'react';
import { Twitter, Download, X as CloseIcon, Gift } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

export default function CelebrationModal({ item, username, onClose }) {
  const cardRef = useRef(null);
  
  // 1. Clean up the sender name logic
  const isAnonymous = !item.sender || 
                     item.sender.toLowerCase() === 'anonymous' || 
                     item.sender.trim() === '';

  const senderDisplay = isAnonymous ? null : item.sender;

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const shareToTwitter = () => {
    const message = isAnonymous 
      ? `OMG! I just received a gift on @WishPeti! 🎁✨ Thank you so much!`
      : `OMG! Huge thanks to ${senderDisplay} for the gift on @WishPeti! 🎁✨`;
    
    const url = `${window.location.origin}/${username}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const downloadForInstagram = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff', 
        scale: 3,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = `WishPeti-Celebration-${username}.png`;
      link.click();
    } catch (err) { console.error("Download failed", err); }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalWrapper}>
        <button onClick={onClose} style={closeBtn}><CloseIcon size={24} /></button>
        
        <div style={modalContent}>
          <div ref={cardRef} style={storyCardStyle}>
            <div style={cardHeader}>WISHPETI.COM</div>
            
            <div style={imageWrapper}>
              <div style={iconFallbackStyle}>
                <Gift size={80} color="#6366f1" strokeWidth={1.5} />
              </div>
            </div>

            <h2 style={cardTitle}>GIFT RECEIVED!</h2>
            
            {/* 2. Dynamic Text based on Anonymity */}
            <p style={cardSubtitle}>
              {!isAnonymous ? (
                <>Huge thanks to <strong>{senderDisplay}</strong> for this amazing gift! 💖</>
              ) : (
                <>Thank you to my amazing supporters for being part of this journey! 💖</>
              )}
            </p>

            <div style={cardFooter}>@{username}</div>
          </div>

          <div style={actionArea}>
            <button onClick={shareToTwitter} style={twitterBtn}>
              <Twitter size={18} fill="currentColor" /> Share on Twitter
            </button>
            <button onClick={downloadForInstagram} style={instaBtn}>
              <Download size={18} /> Save for Instagram Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles remain the same as previous (high quality, centered, and optimized for mobile)
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(10px)', padding: '20px' };
const modalWrapper = { position: 'relative', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const modalContent = { backgroundColor: 'white', borderRadius: '32px', padding: '20px', width: '100%', boxSizing: 'border-box' };
const closeBtn = { position: 'absolute', top: '-50px', right: '0', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const storyCardStyle = { background: 'linear-gradient(135deg, #818cf8 0%, #a855f7 50%, #ec4899 100%)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center', color: 'white', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const cardHeader = { fontWeight: '800', letterSpacing: '4px', fontSize: '12px', marginBottom: '20px', opacity: 0.9 };
const imageWrapper = { width: '200px', height: '200px', backgroundColor: 'white', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', marginBottom: '20px' };
const iconFallbackStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#f8fafc' };
const cardTitle = { fontSize: '32px', fontWeight: '900', margin: '0', lineHeight: '1.1', textTransform: 'uppercase' };
const cardSubtitle = { fontSize: '15px', lineHeight: '1.5', margin: '10px 0 20px', maxWidth: '85%', opacity: 0.95 };
const cardFooter = { fontWeight: '700', fontSize: '22px' };
const actionArea = { marginTop: '20px', display: 'grid', gap: '12px', width: '100%' };
const twitterBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#000', color: 'white', fontWeight: '700', cursor: 'pointer' };
const instaBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', backgroundColor: '#fff', color: '#1e293b', fontWeight: '700', cursor: 'pointer' };