import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import URLInputForm from '../components/URLInputForm';
import { 
  ArrowLeft, Loader2, ShoppingBag, ShieldCheck, 
  Heart, Trash2, Settings2, Edit3, X, Info 
} from 'lucide-react';

export default function ItemDetailView() {
  const { username, itemId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user && item && user.id === item.creator_id;

  useEffect(() => {
    if (itemId) fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (data) {
        setItem(data);
        if (data.is_crowdfund) {
            const remaining = (data.price * (data.quantity || 1)) - (data.amount_raised || 0);
            setContributeAmount(remaining > 0 ? remaining : '');
        }
    }
    setLoading(false);
  };

  const handleAddToCart = async (amount = null) => {
    setIsSubmitting(true);
    try {
      const finalPrice = amount || item.price;
      
      // CRITICAL FIX: Mapping keys to match your public.cart_items schema
      const { error } = await supabase
        .from('cart_items')
        .insert([{
          wishlist_item_id: item.id,      // FIXED: Matches your SQL schema
          user_id: user?.id || null, 
          title: item.title,              // REQUIRED: Matches Not Null constraint
          product_url: item.product_url || '', // REQUIRED: Matches Not Null constraint
          image_url: item.image_url || item.image,
          unit_price: finalPrice,
          price: finalPrice,
          is_contribution: !!amount,
          quantity: 1,
          store: item.store || 'Online Store',
          recipient_id: item.creator_id   // REQUIRED: Matches fkey to auth.users
        }]);

      if (error) throw error;

      setShowContributeModal(false);
      navigate('/cart');
    } catch (err) {
      console.error("Cart Error:", err.message);
      alert(`Database Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this gift?")) return;
    const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
    if (!error) navigate(`/${username}`);
  };

  if (loading || authLoading) return <div style={centerStyle}><Loader2 className="animate-spin" size={40} color="#6366f1" /></div>;
  if (!item) return <div style={centerStyle}><h2>Gift not found</h2><Link to={`/${username}`}>Return</Link></div>;

  const goalAmount = item.price * (item.quantity || 1);
  const progress = Math.min(Math.round(((item.amount_raised || 0) / goalAmount) * 100), 100);

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
          <section style={previewSection}>
            <div style={stickyContainer}>
              <div style={badgeRow}>
                <div style={isOwner ? ownerBadge : previewBadge}>
                  {isOwner ? <Settings2 size={12} /> : <Heart size={12} fill="currentColor" />}
                  <span style={{ marginLeft: '6px' }}>{isOwner ? 'Creator Dashboard' : 'Featured Gift'}</span>
                </div>
              </div>
              <div style={cardScaleWrapper}>
                <WishlistItemCard 
                  item={item}
                  isOwner={isOwner} 
                  username={username}
                  onAddToCart={() => !isOwner && setShowContributeModal(true)}
                  onUpdate={fetchItem} 
                />
              </div>
            </div>
          </section>

          <section style={actionSection}>
            <div style={formCard}>
              {isOwner ? (
                <div style={ownerViewContainer}>
                  <div style={ownerHeader}>
                    <h2 style={formTitle}>Gift Insights</h2>
                    <p style={formSub}>Track funding progress and manage visibility.</p>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={statLabel}>Overall Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1' }}>{progress}%</span>
                    </div>
                    <div style={progressTrack}>
                        <div style={{ ...progressFill, width: `${progress}%` }} />
                    </div>
                  </div>
                  <div style={statsGrid}>
                    <div style={statBox}>
                        <span style={statLabel}>Raised</span>
                        <span style={statValue}>₹{item.amount_raised || 0}</span>
                    </div>
                    <div style={statBox}>
                        <span style={statLabel}>Target</span>
                        <span style={statValue}>₹{goalAmount}</span>
                    </div>
                  </div>
                  <div style={divider} />
                  <h3 style={smallHeading}><Edit3 size={14} /> Edit Details</h3>
                  <URLInputForm mode="edit" initialData={item} onUpdateSuccess={fetchItem} />
                  <div style={dangerZone}>
                    <button style={deleteBtnStyle} onClick={handleDelete}><Trash2 size={16} /><span>Delete</span></button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={formTitle}>Make {username}'s day</h2>
                  <p style={formSub}>{item.is_crowdfund ? "Contribute any amount." : "Add to cart to send."}</p>
                  <div style={buttonContainer}>
                    <button style={primaryBtn} onClick={() => setShowContributeModal(true)}>
                      <ShoppingBag size={20} />
                      <span>{item.is_crowdfund ? 'Contribute to Gift' : 'Add to Cart'}</span>
                    </button>
                  </div>
                  <div style={trustNote}><ShieldCheck size={14} color="#10b981" /><span>Secure via WishPeti</span></div>
                  <div style={shippingInfoBox}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>Privacy Guaranteed</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Safe logistics, private data remains hidden.</p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {showContributeModal && (
        <div style={modalOverlay} onClick={() => setShowContributeModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{item.is_crowdfund ? 'Contribute' : 'Add to Cart'}</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowContributeModal(false)} />
            </div>
            {item.is_crowdfund && (
              <div style={{ marginBottom: '24px' }}>
                <label style={inputLabel}>YOUR CONTRIBUTION (₹)</label>
                <input type="number" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} style={modalInput} autoFocus />
              </div>
            )}
            <button disabled={isSubmitting} style={primaryBtn} onClick={() => item.is_crowdfund ? handleAddToCart(parseFloat(contributeAmount)) : handleAddToCart()}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
              <span>{isSubmitting ? 'Adding...' : 'Confirm & View Cart'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES BLOCK (REMAIN UNCHANGED) ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' };
const navStyle = { backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 };
const navContent = { maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '600' };
const logoStyle = { fontWeight: '900', fontSize: '20px', color: '#6366f1' };
const mainContent = { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' };
const layoutGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' };
const previewSection = { display: 'flex', flexDirection: 'column' };
const stickyContainer = { position: 'sticky', top: '100px' };
const badgeRow = { marginBottom: '20px', display: 'flex', justifyContent: 'center' };
const previewBadge = { backgroundColor: '#6366f1', color: '#fff', padding: '8px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center' };
const ownerBadge = { backgroundColor: '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center' };
const cardScaleWrapper = { maxWidth: '380px', margin: '0 auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.06))' };
const actionSection = { display: 'flex', flexDirection: 'column' };
const formCard = { backgroundColor: '#fff', padding: '32px', borderRadius: '28px', border: '1px solid #e2e8f0' };
const formTitle = { fontSize: '26px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' };
const formSub = { fontSize: '15px', color: '#64748b', marginBottom: '24px' };
const buttonContainer = { marginTop: '10px' };
const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' };
const statBox = { padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' };
const statLabel = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const statValue = { fontSize: '20px', fontWeight: '900', color: '#1e293b', display: 'block', marginTop: '4px' };
const divider = { height: '1px', background: '#f1f5f9', margin: '24px 0' };
const smallHeading = { fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' };
const primaryBtn = { width: '100%', padding: '18px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const dangerZone = { marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' };
const deleteBtnStyle = { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const modalOverlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalContent = { backgroundColor: '#fff', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '400px' };
const modalInput = { width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '18px', fontWeight: '700', boxSizing: 'border-box' };
const inputLabel = { display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '8px' };
const trustNote = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#94a3b8', fontSize: '12px' };
const shippingInfoBox = { marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' };
const centerStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const ownerViewContainer = { width: '100%' };
const ownerHeader = { marginBottom: '20px' };
const progressTrack = { height: '10px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' };
const progressFill = { height: '100%', backgroundColor: '#6366f1', borderRadius: '10px', transition: 'width 0.5s ease' };