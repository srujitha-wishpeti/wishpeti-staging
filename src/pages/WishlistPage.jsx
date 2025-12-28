import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Search, Grid, List, Share2, Pencil, Sparkles } from 'lucide-react';
import AddWishlistItem from '../components/AddWishlistItem';
import { useAuth } from '../auth/AuthProvider';
import ContributeModal from './ContributeModal';
import toast, { Toaster } from 'react-hot-toast';
import { 
  getWishlistItems, 
  deleteWishlistItem, 
  getWishlistStats 
} from '../services/wishlist';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import { supabase } from '../services/supabaseClient';
import './WishlistPage.css';
import Toast from '../components/ui/Toast';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { fetchExchangeRate, getCurrencySymbol } from '../utils/currency';
import {logSupportEvent} from '../utils/supportLogger';

export default function WishlistPage() {  
  const { username } = useParams();
  const { session } = useAuth();
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(null); 
  const navigate = useNavigate();
  const isOwner = !username || (session?.user && profile && session.user.id === profile.id);

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ display_name: '', bio: '', avatar_url: '', banner_url: '' });
  const [contributingItem, setContributingItem] = useState(null);

  const { currency, updateCurrency } = useCurrency();
  const [editingItem, setEditingItem] = useState(null);
  const [showGeoNotice, setShowGeoNotice] = useState(false);
  const [surpriseAmount, setSurpriseAmount] = useState('');

  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const BIO_LIMIT = 160; // Characters before truncating

  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 9;

  const showToast = useToast();
  // 1. ADD THIS: Handle Edit Item
  // This opens the AddWishlistItem modal in "edit mode"
  const handleEditItem = (item) => {
    setEditingItem(item); // This will pass the item data to your AddWishlistItem component
  };

const getNearestGoal = () => {
    const activeCrowdfunds = wishlist.filter(item => {
        const totalGoal = item.price * (item.quantity || 1);
        const raised = item.amount_raised || 0;
        const remaining = totalGoal - raised;

        return (
            item.is_crowdfund && 
            item.status !== 'purchased' &&
            raised > 0 && 
            remaining >= 1 // Only show if at least 1 INR is still needed
        );
    });

    if (activeCrowdfunds.length === 0) return null;

    // Sort by highest percentage raised
    return activeCrowdfunds.sort((a, b) => {
        const pctA = (a.amount_raised / (a.price * (a.quantity || 1)));
        const pctB = (b.amount_raised / (b.price * (b.quantity || 1)));
        return pctB - pctA;
    })[0];
};

const nearestItem = getNearestGoal();

  useEffect(() => {
    // If the currency is not INR (our default) and the user hasn't dismissed the notice
    if (currency.code !== 'INR' && !localStorage.getItem('geo_notice_dismissed')) {
        setShowGeoNotice(true);
    }
  }, [currency.code]);

  useEffect(() => {
    if (profile) {
      setTempProfile({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || ''
      });
    }
  }, [profile]);

  const handleCurrencyChange = async (newCode) => {
    try {
      await updateCurrency(newCode); 
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };
  
  const handleImageUpload = async (e, type) => {
    try {
        setUploading(type);
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${type}_${Math.random()}.${fileExt}`;
        const bucket = type === 'banner' ? 'banners' : 'avatars';

        const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

        const dbColumn = type === 'banner' ? 'banner_url' : 'avatar_url';
        const { error: updateError } = await supabase
        .from('creator_profiles')
        .update({ [dbColumn]: publicUrl })
        .eq('id', session.user.id);

        if (updateError) throw updateError;

        setProfile(prev => ({ ...prev, [dbColumn]: publicUrl }));
        setTempProfile(prev => ({ ...prev, [dbColumn]: publicUrl }));
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated! 📸`);
    } catch (err) {
        console.error(err);
        showToast("Upload failed.");
    } finally {
        setUploading(null);
    }
  };

  const handleUpdateProfile = async () => {
    try {
        const { error } = await supabase
        .from('creator_profiles')
        .update({
            display_name: tempProfile.display_name,
            bio: tempProfile.bio
        })
        .eq('id', session.user.id);

        if (error) throw error;

        setProfile({ ...profile, ...tempProfile }); 
        setEditingProfile(false);
        showToast("Profile updated! ✨");
    } catch (err) {
        showToast("Error updating profile.");
    }
  };

  const fetchPaginatedItems = async (profileId, isInitial = true) => {
    const PAGE_SIZE = 9;
    const start = isInitial ? 0 : wishlist.length;
    const end = start + PAGE_SIZE - 1;

    try {
        // 1. You must add { count: 'exact' } to the select call
        // 2. You must destructure 'count' from the result object
        const { data, error, count } = await supabase
            .from('wishlist_items')
            .select(`
                *,
                orders!fk_item (*)
            `, { count: 'exact' }) // <--- REQUIRED FOR PAGINATION
            .eq('creator_id', profileId)
            .order('priority_level', { ascending: true })
            .order('amount_raised', { ascending: false })
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;

        // Update your totalItems state if this is the initial load
        if (isInitial && count !== null) {
            setTotalItems(count);
        }

        const processedItems = (data || []).map(item => {
            const totalRaised = (item.orders || [])
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + o.amount, 0);
            
            return {
                ...item,
                totalRaised,
                progress: Math.min((totalRaised / item.price) * 100, 100)
            };
        });

        setWishlist(prev => isInitial ? processedItems : [...prev, ...processedItems]);
        
    } catch (err) {
        console.error('fetchPaginatedItems Error:', err);
    }
  };

  const loadData = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    try {
        const searchKey = username ? 'username' : 'id';
        const searchValue = username ? username.toLowerCase() : session?.user?.id;

        if (!searchValue) {
            setLoading(false);
            return;
        }

        // KEEP THE INTEGRATED FIX: Fetch profile data
        // We remove 'wishlist_items' from here to handle them with paging separately
        const { data: profileData, error: profileError } = await supabase
            .from('creator_profiles')
            .select(`*`) 
            .eq(searchKey, searchValue)
            .maybeSingle();

        if (profileError) throw profileError;

        if (profileData) {
            setProfile(profileData);
            // Now fetch items for this specific profile with paging
            await fetchPaginatedItems(profileData.id, isInitial);
        } else {
            setLoading(false);
            setProfile(null);
            navigate('/404', { replace: true });
            return;
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    } finally {
        if (isInitial) setLoading(false);
    }
  };

const totalGiftValue = wishlist.reduce((acc, item) => {
    // Only add to the total if the item is NOT claimed/purchased
    const isClaimed = item.status === 'claimed' || item.status === 'purchased' || (item.quantity !== null && item.quantity <= 0);
    
    if (isClaimed) return acc;

    const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
        : item.price;
    return acc + (isNaN(price) ? 0 : price);
}, 0);

// For now, we can set pendingGifts to 0 or count items marked as 'unbought' 
// if you have a 'bought' status in your DB
  const pendingGifts = wishlist.length;
    useEffect(() => {
        loadData();
  }, [username, session?.user?.id]);


  const handleClaimGift = async (item) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Create the ONE AND ONLY Master Order
        const { error: orderError } = await supabase
            .from('orders')
            .insert([{
                creator_id: user.id,
                items: [item], 
                wishlist_item_id: [item.id],
                subtotal: item.price,
                currency_code: item.currency_code || 'INR',
                gift_status: 'accepted', 
                is_crowdfund_master: true, // ONLY this new row gets 'true'
                is_crowdfund: false,       // We mark this as a "Final Order"
                buyer_name: 'Community Funded'
            }]);

        if (orderError) throw orderError;

        // 2. IMPORTANT: Update all individual contributions for THIS specific item 
        // so they are definitely NOT marked as master.
        await supabase
            .from('orders')
            .update({ is_crowdfund_master: false, is_crowdfund: true })
            .eq('creator_id', user.id)
            .contains('items', [{ id: item.id }]) // Matches orders containing this item
            .neq('buyer_name', 'Community Funded'); // Don't overwrite the master we just made

        // 3. Mark the wishlist item as purchased
        await supabase
            .from('wishlist_items')
            .update({ status: 'purchased' })
            .eq('id', item.id);

        loadData(); 
        showToast("Gift claimed!");
        setContributingItem(null);
        
    } catch (err) {
        console.error("Error:", err.message);
    }
  };

  // 2. UPDATED: Handle Add To Cart / Contribute
  const handleAddToCart = async (item) => {
    if (item.is_crowdfund) {
        if (isOwner) {
        // 🚀 Redirect creator to a stats/manage page instead of the payment modal
        //navigate(`/manage-crowdfund/${item.id}`);
        setContributingItem(item);
        return;
        } else {
        // Fans get the modal
        setContributingItem(item);
        }
        return;
    }

    // Standard "Gift This" logic
    const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    if (existingCart.find(cartItem => cartItem.id === item.id)) {
        console.log("Found duplicate, calling toast...");
        showToast("Already in cart! 🛒");
        return;
    }
    
    let finalPrice;
    
    if (item.is_surprise) {
        // Surprise gifts are already in the correct currency format
        finalPrice = item.price; 
    } else {
        // Standard items from DB are in INR, so convert them
        finalPrice = currency.code === 'INR' ? item.price : (item.price * currency.rate).toFixed(2);
    }
    const itemWithCurrency = { ...item, price: parseFloat(finalPrice), added_currency: currency.code, added_rate: currency.rate };
    
    localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemWithCurrency]));
    window.dispatchEvent(new Event('cartUpdated'));
    showToast(`Added to cart! 🎁`);
  };

  // Inside your Wishlist component
  // Function to handle adding a Surprise Gift to Cart
  // In your Wishlist Page component
  const handleAddSurpriseGift = (amount, creatorId, creatorName, currentCode, currentRate) => {
    
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) return;

    const surpriseId = crypto.randomUUID();
    logSupportEvent('surprise_fund_intent', username, { amount: numericAmount });
    const surpriseItem = {
        id: surpriseId,
        title: "Surprise Gift! 🎁",
        price: numericAmount.toFixed(2), 
        image: "/surprise-box.png",
        is_surprise: true,
        quantity: 1,
        // Pass the values directly from the arguments
        added_currency: currentCode, 
        added_rate: currentRate,
        recipient_id: creatorId, 
        recipient_name: creatorName,
        creator_id: creatorId 
    };

    console.log("Adding gift with manual code pass:", currentCode);
    handleAddToCart(surpriseItem);
    setSurpriseAmount(''); 
    navigate('/cart');
  };

  const confirmDelete = async (id) => {
    // Simple confirmation
    const isConfirmed = window.confirm("Delete this item?");
    
    if (isConfirmed) {
        try {
        await deleteWishlistItem(id);
        showToast("Item removed! 👋");
        loadData(); // Refresh the list
        } catch (err) {
        showToast("Failed to delete item.");
        }
    }
  };

  if (loading || !profile) return <div className="loading-state">Loading...</div>;

  return (
    <div className="wishlist-modern-page">
        <RealtimeAlerts />
      <header className="wishlist-hero-card" style={{ 
            padding: '0', 
            overflow: 'hidden', 
            borderRadius: '24px', // Keeps the card corners rounded
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
        <div className="profile-header-container" style={{ width: '100%', background: 'white' }}>
            
            {/* BANNER SECTION */}
            <div className="banner-wrapper group" style={{ position: 'relative', width: '100%', height: '250px', margin: 0, padding: 0 }}>
                <img 
                    src={profile?.banner_url || 'https://images.unsplash.com/photo-1557683316-973673baf926'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {isOwner && (
                    <button 
                        className="banner-edit-pencil-btn" // New class for CSS targeting
                        onClick={() => setEditingProfile(true)} 
                        style={bannerPencilStyle}
                    >
                        <Pencil size={20} color="white" strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* PROFILE INFO SECTION */}
            <div className="profile-content" style={{ padding: '0 24px 24px 24px' }}>
                <div style={{ display: 'flex',flexDirection: window.innerWidth < 1024 ? 'column' : 'row', alignItems: 'flex-start', gap: window.innerWidth < 1024 ? '16px' : '32px' }}>
                    
                    {/* COLUMN 1: LARGER AVATAR */}
                    <div style={{ 
                        marginTop: '-60px', 
                        flexShrink: 0, 
                        zIndex: 10,
                        position: 'relative', // CRITICAL: This keeps the button pinned to the avatar
                        width: window.innerWidth < 1024 ? '120px' : '140px', 
                        height: window.innerWidth < 1024 ? '120px' : '140px' 
                    }}>
                        <img 
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.display_name}`} 
                            style={{
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%', 
                                border: '6px solid white', 
                                backgroundColor: 'white', 
                                objectFit: 'cover',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)' 
                            }}
                            alt="Profile"
                        />
                        
                        {isOwner && (
                            <button 
                                className="avatar-edit-pencil" 
                                onClick={() => setEditingProfile(true)} 
                                style={{
                                    ...avatarPencilStyle,
                                    position: 'absolute', // Ensures it uses the parent's relative position
                                    width: '32px',
                                    height: '32px',
                                    bottom: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 11
                                }}
                            >
                                <Pencil size={16} color="white" />
                            </button>
                        )}
                    </div>

                    {/* COLUMN 2: IDENTITY & BIO (Takes remaining middle space) */}
                    <div style={{ 
                        flex: 1, 
                        width: '100%', 
                        minWidth: 0, 
                        paddingTop: '10px' 
                    }}>
                        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>
                            {profile?.display_name}
                        </h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>@{profile?.username}</p>
                        
                        <div style={{ margin: '12px 0' }}>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '14px', 
                                color: '#475569', 
                                lineHeight: '1.5'
                            }}>
                                {profile?.bio ? (isBioExpanded ? profile.bio : `${profile.bio.substring(0, 100)}${profile.bio.length > 100 ? '...' : ''}`) : "No bio added yet ✨"}
                            </p>
                            {profile?.bio?.length > 100 && (
                                <button onClick={() => setIsBioExpanded(!isBioExpanded)} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: '700', padding: 0, cursor: 'pointer' }}>
                                    {isBioExpanded ? 'Show Less' : 'Read More'}
                                </button>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                            <span>{wishlist.length} items</span>
                            <span>•</span>
                            <span>{getCurrencySymbol(currency.code)}{(wishlist.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0) * currency.rate).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* COLUMN 3: GOAL CARD & BUTTONS (Aligned Right) */}
                    {/* COLUMN 3: GOAL CARD & CONTROLS */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        width: window.innerWidth < 1024 ? '100%' : '320px',
                        flexShrink: 0 
                    }}>
                        {nearestItem && (
                            <div onClick={() => navigate(`/${profile?.username}/item/${nearestItem.id}`)} style={{ cursor: 'pointer' }}>
                                <div style={{...statCardHighlight, width: '100%', boxSizing: 'border-box'}}>
                                    <label style={tinyLabelStyle}>CLOSEST TO GOAL 🚀</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={nearestItem.image || nearestItem.image_url} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nearestItem.title}</div>
                                            <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '800' }}>
                                                Only {getCurrencySymbol(currency.code)}{(( (parseFloat(nearestItem.price) - (nearestItem.amount_raised || 0)) * currency.rate).toFixed(2))} left!
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={currency.code} onChange={(e) => handleCurrencyChange(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                            <button className="modern-share-btn" style={{...shareButtonStyle, flex: 2}} onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                showToast("Link copied! 🔗");
                            }}>
                                <Share2 size={16} /> Share List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {!isOwner && wishlist.length > 0 && (
        <section className="surprise-me-card" style={surpriseCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={iconCircleStyle}><Sparkles size={18} color="#6366f1" /></div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                        Surprise {profile?.display_name.split(' ')[0]}
                    </h4>
                    {/* Updated explanation for clarity on funds/withdrawals */}
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                        Send a cash gift that {profile?.display_name.split(' ')[0]} can use to fund any item in their Peti.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Input with inline currency symbol */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        fontSize: '14px', 
                        color: '#94a3b8', 
                        fontWeight: '600' 
                    }}>
                        {currency.symbol || getCurrencySymbol(currency.code)}
                    </span>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        value={surpriseAmount}
                        onChange={(e) => setSurpriseAmount(e.target.value)}
                        style={{
                            ...surpriseInputStyle,
                            paddingLeft: '28px', // Space for the symbol
                            width: '110px'
                        }} 
                    />
                </div>

                <button 
                    onClick={() => handleAddSurpriseGift(surpriseAmount, profile?.id, profile?.display_name, currency.code, currency.rate)} 
                    style={surpriseButtonStyle}
                >
                    Send Gift
                </button>
            </div>
        </section>
      )}

      {isOwner && (
        <section className="creator-stats-bar" style={dashboardStatsStyle}>
            <div style={statGroupStyle}>
            <div style={statItemStyle}>
                <span style={statLabelStyle}>TOTAL GIFT VALUE</span>
                <span style={statValueStyle}>
                {currency.code === 'INR' ? '₹' : currency.code + ' '}
                {(totalGiftValue * currency.rate).toLocaleString(undefined, { 
                    minimumFractionDigits: currency.code === 'INR' ? 0 : 2,
                    maximumFractionDigits: 2
                })}
                </span>
            </div>
            <div style={statDividerStyle} />
            <div style={statItemStyle}>
                <span style={statLabelStyle}>ITEMS IN PETI</span>
                <span style={statValueStyle}>{wishlist.length}</span>
            </div>
            <div style={statDividerStyle} />
            <div style={statItemStyle}>
                <span style={statLabelStyle}>STATUS</span>
                <span style={{...statValueStyle, color: '#10b981', fontSize: '14px'}}>
                Ready for Gifting ✨
                </span>
            </div>
            </div>
            
            <button 
            style={manageGiftsButtonStyle} 
            onClick={() => showToast("Order history coming soon! 📦")}
            >
            View Recent Givers
            </button>
        </section>
      )}

      <section className="modern-controls-container" style={{ marginTop: isOwner ? '20px' : '40px' }}>
        <div className="search-bar-wrapper">
          <Search size={20} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modern-search-input"
          />
        </div>
        <div className="controls-buttons-group">
          <div className="view-toggle-pills">
             <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><Grid size={18}/></button>
             <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List size={18}/></button>
          </div>
          
          {/* 3. ENSURE THIS COMPONENT HANDLES EDITING */}
          {isOwner && (
            <AddWishlistItem 
                session={session} 
                onItemAdded={() => { setEditingItem(null); loadData(); }} 
                currency={currency} 
                initialData={editingItem} // Your item object
                isEditing={!!editingItem} // True if editingItem is not null
                onClose={() => {
                    setEditingItem(null);
                    loadData(); // Refresh list after edit
                }} 
            />
          )}
        </div>
      </section>

      

      {/* ITEMS DISPLAY */}
      <main className="wishlist-display-area">
        <div className={`wishlist-container-${viewMode}`}>
            {wishlist
            .filter(item => (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                const aClaimed = a.status === 'claimed' || a.status === 'purchased' || a.quantity <= 0;
                const bClaimed = b.status === 'claimed' || b.status === 'purchased' || b.quantity <= 0;

                // 1. If one is claimed and the other isn't, move claimed to the end
                if (aClaimed !== bClaimed) {
                return aClaimed ? 1 : -1;
                }

                // 2. If both are in the same claimed state, sort by Priority Level (1, 2, 3)
                // We use || 3 to default items without a priority to "Standard"
                const aPriority = a.priority_level || 3;
                const bPriority = b.priority_level || 3;

                if (aPriority !== bPriority) {
                return aPriority - bPriority; // Ascending: 1 (High) comes before 3 (Standard)
                }

                // 3. If priority is also the same, sort by newest first
                return new Date(b.created_at) - new Date(a.created_at);
            })
            .map(item => (
                <WishlistItemCard 
                key={item.id} 
                item={item} 
                isOwner={isOwner} 
                onEdit={handleEditItem} 
                onUpdate={loadData} // Added this to refresh UI when priority changes
                onDelete={() => confirmDelete(item.id)}
                onAddToCart={() => handleAddToCart(item)}
                username={username || profile?.username}
                currencySettings={currency}
                />
            ))}
        </div>
        {/* Only show if we haven't loaded everything yet */}
        {wishlist.length < totalItems && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <button 
                    onClick={() => fetchPaginatedItems(profile.id, false)}
                    className="load-more-btn"
                    style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Load More
                </button>
            </div>
        )}
        </main>

      {contributingItem && (
        <ContributeModal 
            item={contributingItem}
            isOwner={isOwner}
            currency={currency}
            onClose={() => setContributingItem(null)}
            onClaimGift={() => handleClaimGift(contributingItem)}
            onSuccess={() => {
            setContributingItem(null);
            loadData(); // Refresh the progress bar on the main page
            }}
        />
      )}

      {showGeoNotice && (
        <div className="geo-banner">
            <p>Prices shown in <strong>{currency.code}</strong> based on your location.</p>
            <button onClick={() => {
            setShowGeoNotice(false);
            localStorage.setItem('geo_notice_dismissed', 'true');
            }}>Got it</button>
        </div>
      )}

      {/* EDIT MODAL WITH WORKING BUTTONS */}
      {editingProfile && (
        <div className="edit-overlay" style={overlayStyle}>
            <div className="edit-modal" style={modalStyle}>
                <div className="modal-header" style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Update Your Profile</h3>
                    <button onClick={() => setEditingProfile(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ position: 'relative', marginBottom: '60px' }}>
                        {/* Banner Preview */}
                        <div style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9' }}>
                            <img 
                                src={tempProfile.banner_url || 'https://via.placeholder.com/800x200'} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <label style={bannerEditButtonStyle}>
                                <Camera size={16} /> {uploading === 'banner' ? '...' : 'Change Cover'}
                                <input type="file" style={{ display: 'none' }} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                            </label>
                        </div>

                        {/* Avatar Preview */}
                        <div style={{ position: 'absolute', bottom: '-40px', left: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={tempProfile.avatar_url || 'https://via.placeholder.com/100'} 
                                    style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' }} 
                                />
                                <label style={avatarEditButtonStyle}>
                                    <Camera size={14} color="white" />
                                    <input type="file" style={{ display: 'none' }} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Display Name</label>
                            <input 
                                className="modern-search-input"
                                value={tempProfile.display_name}
                                onChange={(e) => setTempProfile({...tempProfile, display_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Bio</label>
                            <textarea 
                                className="modern-search-input"
                                style={{ minHeight: '80px', resize: 'none' }}
                                value={tempProfile.bio}
                                onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                            />
                        </div>
                        <button onClick={handleUpdateProfile} className="btn-main-action" style={{ width: '100%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function RealtimeAlerts({ setMsg, setShow }) {
  useEffect(() => {
    const channel = supabase
      .channel('live-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
          // Filter removed as per your change
        },
        (payload) => {
          console.log("New order row:", payload.new);
          
          // Use "new" values but provide "Fallbacks" for anything missing
          const buyer = payload.new.buyer_name || 'A Kind Supporter';
          
          // Check if amount exists, otherwise use 0 or a placeholder
          const rawAmount = payload.new.total_amount || 0;
          const currency = payload.new.currency_code || 'INR';
          const symbol = getCurrencySymbol(currency);

          // Format the message
          const message = `${buyer} just sent a ${symbol}${rawAmount.toLocaleString()} gift! 🎁`;
          
          showToast(message);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [setMsg, setShow]);

  return null;
}

// Minimalist Alert Styles
const alertStyle = (visible) => ({
  transform: visible ? 'translateX(0)' : 'translateX(-100%)',
  opacity: visible ? 1 : 0,
  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  background: 'white',
  padding: '16px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  minWidth: '280px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  border: '1px solid #e2e8f0',
});

const iconStyle = {
  fontSize: '20px',
  background: '#f0fdf4',
  width: '45px',
  height: '45px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '14px',
  border: '1px solid #bbf7d0'
};

// STYLES
const bannerPencilStyle = { 
    position: 'absolute', 
    bottom: '20px', 
    right: '20px', 
    background: 'rgba(15, 23, 42, 0.6)', // Deep slate with transparency
    border: '1px solid rgba(255, 255, 255, 0.2)', 
    borderRadius: '50%', 
    width: '44px', 
    height: '44px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backdropFilter: 'blur(8px)', // Blurs the image behind the button
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
    zIndex: 10
};
const avatarPencilStyle = { 
    position: 'absolute', 
    bottom: '5px', 
    right: '5px', 
    background: '#4f46e5', // Brand indigo
    border: '3px solid white', 
    borderRadius: '50%', 
    width: '34px', 
    height: '34px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 11
};
const shareButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer', color: '#1e293b' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalStyle = { backgroundColor: 'white', borderRadius: '16px', width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' };
const bannerEditButtonStyle = { position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' };
const avatarEditButtonStyle = { position: 'absolute', bottom: '0', right: '0', background: '#4f46e5', width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

const dashboardStatsStyle = {
  maxWidth: '1000px',
  margin: '20px auto 0',
  padding: '20px',
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

const statGroupStyle = { display: 'flex', alignItems: 'center', gap: '40px' };
const statItemStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const statLabelStyle = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em' };
const statValueStyle = { fontSize: '20px', fontWeight: '800', color: '#1e293b' };
const statDividerStyle = { width: '1px', height: '30px', background: '#e2e8f0' };
const avatarImageStyle = { width: '130px', height: '130px', borderRadius: '50%', border: '5px solid white', backgroundColor: 'white', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const surpriseCardStyle = { maxWidth: '1000px', margin: '25px auto 0', padding: '16px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' };
const iconCircleStyle = { width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const surpriseInputStyle = { width: '80px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const surpriseButtonStyle = { background: '#6366f1', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };
const manageGiftsButtonStyle = {
  background: '#1e293b',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '12px',
  border: 'none',
  fontWeight: '700',
  fontSize: '14px',
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};
const tinyLabelStyle = { 
  fontSize: '10px', 
  fontWeight: '800', 
  color: '#94a3b8', 
  textTransform: 'uppercase', 
  display: 'block', 
  marginBottom: '4px' 
};

const statCardHighlight = {
  background: '#ffffff',
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  minWidth: '240px'
};

const statCardStyle = {
  background: '#f8fafc',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  minWidth: '200px'
};
