import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Search, Grid, List, Share2, Pencil } from 'lucide-react';
import AddWishlistItem from '../components/AddWishlistItem';
import { useAuth } from '../auth/AuthProvider';
import ContributeModal from './ContributeModal';

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

export default function WishlistPage() {  
  const { username } = useParams();
  const { session } = useAuth();
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [profile, setProfile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [uploading, setUploading] = useState(null); 

  const isOwner = !username || (session?.user && profile && session.user.id === profile.id);

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ display_name: '', bio: '', avatar_url: '', banner_url: '' });
  const [contributingItem, setContributingItem] = useState(null);

  const { currency, updateCurrency } = useCurrency();
  const [editingItem, setEditingItem] = useState(null);
  // 1. ADD THIS: Handle Edit Item
  // This opens the AddWishlistItem modal in "edit mode"
  const handleEditItem = (item) => {
    setEditingItem(item); // This will pass the item data to your AddWishlistItem component
  };

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
        setToastMsg(`${type.charAt(0).toUpperCase() + type.slice(1)} updated! 📸`);
        setShowToast(true);
    } catch (err) {
        console.error(err);
        setToastMsg("Upload failed.");
        setShowToast(true);
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
        setToastMsg("Profile updated! ✨");
        setShowToast(true);
    } catch (err) {
        setToastMsg("Error updating profile.");
        setShowToast(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
        let profileData = null;
        if (username) {
            const { data } = await supabase
                .from('creator_profiles')
                .select('*')
                .eq('username', username.toLowerCase())
                .single();
            profileData = data;
        } else if (session?.user) {
            const { data } = await supabase
                .from('creator_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            profileData = data;
        }

        if (profileData) {
            setProfile(profileData);
            const items = await getWishlistItems(profileData.id);
            setWishlist(items || []);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        setLoading(false);
    }
  };

  const totalGiftValue = wishlist.reduce((acc, item) => {
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

  // 2. UPDATED: Handle Add To Cart / Contribute
  const handleAddToCart = async (item) => {
    // If it's a crowdfunded item, we handle it differently
    if (item.is_crowdfund) {
      // Logic for crowdfunding contribution (e.g., opening a payment modal)
      
      setContributingItem(item); 
      return;
    }

    // Standard "Gift This" logic
    const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
    if (existingCart.find(cartItem => cartItem.id === item.id)) {
        setToastMsg("Already in cart! 🛒");
        setShowToast(true);
        return;
    }
    
    const finalPrice = currency.code === 'INR' ? item.price : (item.price * currency.rate).toFixed(2);
    const itemWithCurrency = { ...item, price: parseFloat(finalPrice), added_currency: currency.code };
    
    localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemWithCurrency]));
    window.dispatchEvent(new Event('cartUpdated'));
    setToastMsg(`Added to cart! 🎁`);
    setShowToast(true);
  };

  if (loading || !profile) return <div className="loading-state">Loading...</div>;

  return (
    <div className="wishlist-modern-page">
      <header className="wishlist-hero-card">
        <div className="profile-header-container" style={{ width: '100%', background: 'white' }}>
            
            {/* BANNER SECTION */}
            <div className="banner-wrapper group" style={{ position: 'relative', width: '100%', height: '250px' }}>
                <img 
                    src={profile?.banner_url || 'https://images.unsplash.com/photo-1557683316-973673baf926'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
            <div className="profile-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* AVATAR */}
                    <div className="profile-avatar-wrapper" style={{ marginTop: '-60px', position: 'relative' }}>
                        <img 
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.display_name}`} 
                            style={{
                                width: '130px', height: '130px',
                                borderRadius: '50%', border: '5px solid white',
                                backgroundColor: 'white', objectFit: 'cover',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        {isOwner && (
                            <button className="avatar-edit-pencil" onClick={() => setEditingProfile(true)} style={avatarPencilStyle}>
                                <Pencil size={14} color="white" />
                            </button>
                        )}
                    </div>

                    {/* RESTORED BIO AND STATS */}
                    <div style={{ paddingBottom: '15px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                                    {profile?.display_name}
                                </h1>
                                <p style={{ margin: 0, color: '#64748b' }}>@{profile?.username}</p>
                                <p style={{ margin: '8px 0', fontSize: '15px', color: '#475569', maxWidth: '600px' }}>
                                    {profile?.bio || "No bio added yet ✨"}
                                </p>
                                
                                <div className="hero-stats" style={{ display: 'flex', gap: '15px', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                                    <span>{wishlist.length || 0} items</span>
                                    <span style={{ color: '#cbd5e1' }}>•</span>
                                    <span>
                                        {currency.code === 'INR' ? '₹' : currency.code + ' '}
                                        {(wishlist.reduce((acc, item) => {
                                            const price = typeof item.price === 'string' 
                                                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                                                : item.price;
                                            return acc + (isNaN(price) ? 0 : price);
                                        }, 0) * currency.rate).toLocaleString(undefined, { 
                                            minimumFractionDigits: currency.code === 'INR' ? 0 : 2 
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <select 
                                    className="currency-dropdown-minimal"
                                    value={currency.code}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                                
                                {/* RESTORED SHARE URL LOGIC */}
                                <button className="modern-share-btn" style={shareButtonStyle} onClick={() => {
                                    const shareUrl = `${window.location.origin}/wishlist/${profile?.username}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    setToastMsg("Link copied! 🔗");
                                    setShowToast(true);
                                }}>
                                    <Share2 size={16} /> Share List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {isOwner && (
        <section className="creator-stats-bar" style={dashboardStatsStyle}>
            <div style={statGroupStyle}>
            <div style={statItemStyle}>
                <span style={statLabelStyle}>TOTAL GIFT VALUE</span>
                <span style={statValueStyle}>
                {currency.code === 'INR' ? '₹' : currency.code + ' '}
                {(totalGiftValue * currency.rate).toLocaleString(undefined, { 
                    minimumFractionDigits: currency.code === 'INR' ? 0 : 2 
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
            onClick={() => setToastMsg("Order history coming soon! 📦")}
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
                .map(item => (
                    <WishlistItemCard 
                        key={item.id} 
                        item={item} 
                        isOwner={isOwner} 
                        onEdit={handleEditItem} // Now properly defined
                        onDelete={(id) => deleteWishlistItem(id).then(loadData)} 
                        onAddToCart={() => handleAddToCart(item)}
                        username={username || profile?.username}
                        currencySettings={currency}
                    />
            ))}
        </div>
      </main>
      {contributingItem && (
        <ContributeModal 
            item={contributingItem}
            currency={currency}
            onClose={() => setContributingItem(null)}
            onSuccess={() => {
            setContributingItem(null);
            loadData(); // Refresh the progress bar on the main page
            }}
        />
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

      {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
}

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