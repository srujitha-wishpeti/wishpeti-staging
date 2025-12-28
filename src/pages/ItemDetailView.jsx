import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencySymbol, getBaseInrSync } from '../utils/currency';
import { useToast } from '../context/ToastContext'; 
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import UrlInputForm from '../components/UrlInputForm';
import { 
  ArrowLeft, Loader2, ShoppingBag, ShieldCheck, 
  Heart, Trash2, Edit3, Info, Settings2
} from 'lucide-react';

import ContributeModal from './ContributeModal';

export default function ItemDetailView() {
  const { username, itemId } = useParams();
  const { user, session, loading: authLoading } = useAuth();
  const { currency, formatPrice, convertPrice } = useCurrency(); // Added currency logic
  const showToast = useToast();
  const navigate = useNavigate();

  const BUFFER_MULTIPLIER = 1.18; //pltform fee
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const isOwner = useMemo(() => {
    const currentUserId = user?.id || session?.user?.id;
    if (!currentUserId || !item?.creator_id) return false;
    return String(currentUserId) === String(item.creator_id);
  }, [user, session, item]);

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

    if (data) setItem(data);
    setLoading(false);
  };

  // SAFETY LOCK: Check if money has been raised
  const hasFunds = (item?.amount_raised || 0) > 0;

  const handleAddToCart = () => {
    const cartKey = 'wishlist_cart'; 
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const isDuplicate = existingCart.find(cartItem => cartItem.id === item.id);
    
    if (isDuplicate) {
        showToast("Already in your basket! 🛒", "info");
        navigate('/cart');
        return;
    }

    const cartItem = {
        ...item,
        price: parseFloat(item.price), // DB price is already INR
        added_currency: 'INR',
        added_rate: 1,
        quantity: 1
    };
    
    localStorage.setItem(cartKey, JSON.stringify([...existingCart, cartItem]));
    window.dispatchEvent(new Event('cartUpdated')); // Sync navbar count
    showToast("Added to basket! 🎁");
    navigate('/cart');
  };

  const handleDelete = async () => {
    if (hasFunds) {
      showToast("Cannot delete: Funding has already started.", "error");
      return;
    }
    if (!window.confirm("Remove this gift from your wishlist?")) return;
    const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
    if (!error) {
        showToast("Item removed");
        navigate(`/${username}`);
    }
  };

  if (loading || authLoading) return <div style={centerStyle}><Loader2 className="animate-spin" size={40} color="#6366f1" /></div>;
  if (!item) return <div style={centerStyle}><h2>Gift not found</h2><Link to={`/${username}`}>Return</Link></div>;

  // Unified Price Calculations using the Context
  const totalGoal = item.price * (item.quantity || 1);
  const raised = item.amount_raised || 0;
  const progressPercent = Math.min(Math.round((raised / totalGoal) * 100), 100);

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
          {/* LEFT: Item Preview */}
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
                  onUpdate={fetchItem}
                  onAddToCart={() => {
                    if (item.is_crowdfund) {
                      setShowContributeModal(true);
                    } else {
                      handleAddToCart();
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* RIGHT: Dashboard / Action Panel */}
          <section style={actionSection}>
            <div style={formCard}>
              {isOwner ? (
                <div style={ownerViewContainer}>
                  <div style={ownerHeader}>
                    <h2 style={formTitle}>Gift Insights</h2>
                    <p style={formSub}>
                        {item.is_crowdfund ? "Track contributions toward your goal." : "Manage your standard gift details."}
                    </p>
                  </div>

                  {!isEditingMode && item.is_crowdfund && (
                    <div style={crowdfundStatsContainer}>
                      <div style={statsGrid}>
                        <div style={statBox}>
                          <span style={statLabel}>Raised</span>
                          {/* CONVERTED PRICE */}
                          <span style={statValue}>{formatPrice(raised)}</span>
                        </div>
                        <div style={statBox}>
                          <span style={statLabel}>Target</span>
                          {/* CONVERTED PRICE */}
                          <span style={statValue}>{formatPrice(totalGoal)}</span>
                        </div>
                      </div>

                      <div style={progressWrapper}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={statLabel}>Funding Progress</span>
                          <span style={progressText}>{progressPercent}%</span>
                        </div>
                        <div style={progressTrack}>
                          <div style={{ ...progressFill, width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isEditingMode && !item.is_crowdfund && (
                    <div style={standardNotice}>
                      <ShoppingBag size={14} />
                      <span>Standard Gift: Fans purchase the full item.</span>
                    </div>
                  )}

                  <div style={divider} />
                    {!isEditingMode ? (
                      <button 
                        style={editToggleBtn} 
                        onClick={() => {
                          // 1. Get the raw buffered price from DB (which is in INR)
                          const rawPrice = parseFloat(item.price) || 0; 
                          
                          // 2. Remove the 18% buffer to get the original base INR price
                          const originalBaseInr = rawPrice / BUFFER_MULTIPLIER;

                          // 3. Convert that original price to the current viewing currency
                          const displayPrice = (originalBaseInr * currency.rate).toFixed(2);

                          // 4. Update local state for the form
                          setItem({ ...item, price: displayPrice });
                          setIsEditingMode(true);
                        }}
                      >
                        <Edit3 size={16} />
                        <span>Edit Gift Details</span>
                      </button>
                    ) : (
                      <UrlInputForm 
                        isEditing={true} 
                        editableData={item} 
                        setEditableData={setItem} 
                        currencySymbol={getCurrencySymbol(currency.code)} // Pass symbol from context
                        currencyCode={currency.code} // Pass code from context
                        onContinue={async () => {
                          // 1. Get the price the user entered in their currency
                          const inputPrice = parseFloat(item.price) || 0;

                          // 2. Convert back to base INR (divide by current rate)
                          const basePriceINR = currency.code !== 'INR' 
                              ? inputPrice / currency.rate 
                              : inputPrice;

                          // 3. Re-apply the 18% Buffer for database storage
                          const finalBufferedPrice = parseFloat((basePriceINR * BUFFER_MULTIPLIER).toFixed(2));

                          const { error } = await supabase
                            .from('wishlist_items')
                            .update({ 
                              ...item, 
                              price: finalBufferedPrice // Always save the buffered INR value
                            })
                            .eq('id', item.id);

                          if (!error) {
                            fetchItem();
                            setIsEditingMode(false); 
                            showToast("Gift updated!");
                          }
                        }}
                        onCancel={() => {
                          setIsEditingMode(false);
                          fetchItem(); // Reset to DB state
                        }}
                      />
                    )}
                  
                  <div style={dangerZone}>
                    {hasFunds && (
                      <div style={lockNotice}>
                        <Info size={14} />
                        <span>Cannot delete item once funding has started.</span>
                      </div>
                    )}
                    <button 
                      style={{
                        ...deleteBtnStyle, 
                        opacity: hasFunds ? 0.5 : 1,
                        cursor: hasFunds ? 'not-allowed' : 'pointer',
                        backgroundColor: hasFunds ? '#f1f5f9' : 'transparent'
                      }} 
                      onClick={handleDelete}
                      disabled={hasFunds}
                    >
                      <Trash2 size={16} />
                      <span>Delete from Wishlist</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* FAN VIEW */
                <>
                  <h2 style={formTitle}>Make {username}'s day</h2>
                  <p style={formSub}>
                    {item.is_crowdfund 
                      ? "This is a crowdfunded gift. Contribute any amount to help reach the goal!" 
                      : `Add this gift to your cart to checkout.`}
                  </p>
                  
                  <button 
                    style={primaryBtn} 
                    onClick={() => item.is_crowdfund ? setShowContributeModal(true) : handleAddToCart()}
                  >
                    <ShoppingBag size={20} />
                    <span>
                        {item.is_crowdfund ? 'Contribute Now' : `Add to Cart • ${formatPrice(item.price)}`}
                    </span>
                  </button>

                  <div style={trustNote}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Secure Checkout via WishPeti</span>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {showContributeModal && (
        <ContributeModal
          item={item}
          isOwner={isOwner}
          onClose={() => setShowContributeModal(false)}
          onSuccess={() => {
            setShowContributeModal(false);
            fetchItem();
          }}
        />
      )}
    </div>
  );
}

// --- STYLES (Kept exactly as per your request) ---
const pageWrapper = { minHeight: '100vh', backgroundColor: '#f8fafc' };
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
const cardScaleWrapper = { maxWidth: '380px', margin: '0 auto' };
const actionSection = { display: 'flex', flexDirection: 'column' };
const formCard = { backgroundColor: '#fff', padding: '32px', borderRadius: '28px', border: '1px solid #e2e8f0' };
const formTitle = { fontSize: '26px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' };
const formSub = { fontSize: '15px', color: '#64748b', marginBottom: '24px' };
const crowdfundStatsContainer = { marginBottom: '24px' };
const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' };
const statBox = { padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' };
const statLabel = { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };
const statValue = { fontSize: '20px', fontWeight: '900', color: '#1e293b', display: 'block', marginTop: '4px' };
const progressWrapper = { marginTop: '16px' };
const progressText = { fontSize: '12px', fontWeight: '900', color: '#6366f1' };
const progressTrack = { height: '10px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' };
const progressFill = { height: '100%', backgroundColor: '#6366f1', borderRadius: '10px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' };
const divider = { height: '1px', background: '#f1f5f9', margin: '24px 0' };
const editToggleBtn = { width: '100%', padding: '14px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const primaryBtn = { width: '100%', padding: '18px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const dangerZone = { marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' };
const lockNotice = { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', marginBottom: '12px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' };
const deleteBtnStyle = { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const trustNote = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#94a3b8', fontSize: '12px' };
const centerStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const ownerViewContainer = { width: '100%' };
const ownerHeader = { marginBottom: '20px' };
const standardNotice = { padding: '14px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', marginBottom: '20px' };