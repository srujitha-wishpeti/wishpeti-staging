import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import URLInputForm from '../components/URLInputForm';
import ContributeModal from './ContributeModal'; 
import { ArrowLeft, Loader2, Heart, ShoppingBag, Users, ShieldCheck } from 'lucide-react';

export default function ItemDetailView() {
  const { username, itemId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived State: Detection happens instantly when user or item changes
  const isOwner = user && item && user.id === item.creator_id;

  useEffect(() => {
    if (itemId) fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (data) setItem(data);
    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div style={centerStyle}>
        <Loader2 className="animate-spin" size={40} color="#6366f1" />
        <p style={{ color: '#64748b', marginTop: '12px' }}>Loading gift details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={centerStyle}>
        <h2>Gift not found</h2>
        <Link to={`/${username}`} style={{ color: '#6366f1', fontWeight: '600' }}>Return to Wishlist</Link>
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      <nav style={navStyle}>
        <div style={navContent}>
          <button onClick={() => navigate(`/${username}`)} style={backBtn}>
            <ArrowLeft size={18} />
            <span>Back to {username}'s list</span>
          </button>
          <div style={logoStyle}>WishPeti</div>
        </div>
      </nav>

      <main style={mainContent}>
        <div style={layoutGrid}>
          
          {/* LEFT: VISUAL PREVIEW */}
          <section style={previewSection}>
            <div style={stickyContainer}>
              <div style={cardScaleWrapper}>
                <WishlistItemCard 
                  item={item}
                  isOwner={false} 
                  username={username}
                  onAddToCart={() => {}} 
                />
              </div>
            </div>
          </section>

          {/* RIGHT: ACTION SECTION */}
          <section style={actionSection}>
            <div style={formCard}>
              {isOwner ? (
                <>
                  <h2 style={formTitle}>Edit Your Gift</h2>
                  <URLInputForm mode="edit" initialData={item} onUpdateSuccess={fetchItem} />
                </>
              ) : (
                <>
                  <h2 style={formTitle}>Make {username}'s day</h2>
                  <p style={formSub}>
                    {item.is_crowdfund 
                      ? "This is a crowdfunded gift. You can contribute a portion or the full amount." 
                      : "Add this gift to your cart to checkout and send it to the creator."}
                  </p>

                  <div style={buttonContainer}>
                    <button 
                      style={primaryBtn}
                      onClick={() => {
                        // Assuming you have a function to add to cart
                        // onAddToCart(item); 
                        navigate('/cart');
                      }}
                    >
                      <ShoppingBag size={20} />
                      <span>Add to Cart — {item.is_crowdfund ? 'Contribute' : 'Full Gift'}</span>
                    </button>
                  </div>
                  
                  <div style={trustNote}>
                    <ShieldCheck size={14} />
                    <span>Secure checkout via Razorpay</span>
                  </div>
                </>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// --- STYLES (Includes all missing definitions) ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' };
const navStyle = { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 };
const navContent = { maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' };
const logoStyle = { fontWeight: '900', fontSize: '20px', color: '#6366f1' };
const mainContent = { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' };
const layoutGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'start' };
const previewSection = { display: 'flex', flexDirection: 'column' };
const stickyContainer = { position: 'sticky', top: '100px' };
const badgeRow = { marginBottom: '16px', display: 'flex', justifyContent: 'center' };
const previewBadge = { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' };
const cardScaleWrapper = { maxWidth: '360px', margin: '0 auto' };
const actionSection = { display: 'flex', flexDirection: 'column' };
const formCard = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const formTitle = { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' };
const formSub = { fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' };
const divider = { border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' };
const giftHeader = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' };
const formWrapper = { marginTop: '10px' };
const safetyNote = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px', color: '#94a3b8', fontSize: '12px' };
const centerStyle = { display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' };
const buttonContainer = { marginTop: '30px' };
const primaryBtn = {
  width: '100%',
  padding: '18px',
  backgroundColor: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  fontWeight: '700',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};
const trustNote = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#94a3b8', fontSize: '12px' };