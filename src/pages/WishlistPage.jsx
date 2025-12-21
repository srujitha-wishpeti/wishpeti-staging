import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Search, Grid, List, Share2, Pencil } from 'lucide-react';
import AddWishlistItem from '../components/AddWishlistItem';
import { useAuth } from '../auth/AuthProvider';

import { 
  getWishlistItems, 
  deleteWishlistItem, 
  getWishlistStats 
} from '../services/wishlist';
import { addToCart } from '../services/cart';
import WishlistItemCard from '../components/wishlist/WishlistItemCard';
import { supabase } from '../services/supabaseClient';
import './WishlistPage.css';
import Toast from '../components/ui/Toast';
import { useCurrency } from '../context/CurrencyContext';

export default function WishlistPage() {
  const { username } = useParams();
  const { session } = useAuth();
  
  // States
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  // Determine if this is the user's own profile
  // 1. If there is NO username in the URL, it's the private dashboard.
  // 2. If there IS a username, check if it matches the logged-in user's profile.
  const isOwner = !username || (session?.user && profile && session.user.id === profile.id);

  // Profile Editing States
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ display_name: '', bio: '' });

  const { currency, updateCurrency } = useCurrency();
  const [editingItem, setEditingItem] = useState(null);

  // 🚀 Keep tempProfile in sync when profile loads
  useEffect(() => {
    if (profile) {
      setTempProfile({
        display_name: profile.display_name || '',
        bio: profile.bio || ''
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
  
  const handleImageUpload = async (e) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;

        // Create a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
        const filePath = fileName;

        // 1. Upload to Supabase Storage 'avatars' bucket
        const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // 2. Get the public URL
        const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

        // 3. Update the creator_profiles table
        const { error: updateError } = await supabase
        .from('creator_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

        if (updateError) throw updateError;

        // 4. Update local state
        setProfile({ ...profile, avatar_url: publicUrl });
        setToastMsg("Profile picture updated! 📸");
        setShowToast(true);
    } catch (err) {
        console.error(err);
        setToastMsg("Failed to upload image.");
        setShowToast(true);
    } finally {
        setUploading(false);
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
        setToastMsg("Profile updated successfully! ✨");
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

            // 1. Identify the profile to load
            if (username) {
            // PUBLIC VIEW
            const { data, error } = await supabase
                .from('creator_profiles')
                .select('*')
                .eq('username', username.toLowerCase())
                .single();
            profileData = data;
            } else if (session?.user) {
            // PRIVATE VIEW
            const { data, error } = await supabase
                .from('creator_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            profileData = data;
            }

            // 2. Fetch stats and items using the profileData ID
            if (profileData) {
            setProfile(profileData);
            
            // Use the ID from the profile we just fetched, NOT the session
            const [items, statistics] = await Promise.all([
                getWishlistItems(profileData.id),
                getWishlistStats(profileData.id) 
            ]);

            setWishlist(items || []);
            setStats(statistics); // This fills stats.totalItems and stats.totalValue
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        setLoading(false);
    }
  };

  const getAvatarUrl = (profile) => {
    if (profile?.avatar_url) return profile.avatar_url;
    
    // Return a high-quality initials fallback if no URL exists
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || 'User')}&background=6366f1&color=fff&size=200`;
  };

  useEffect(() => {
    const loadProfile = async () => {
        setLoading(true);
        try {
        let data;
        if (username) {
            // Public View
            const { data: publicData } = await supabase
            .from('creator_profiles')
            .select('*')
            .eq('username', username.toLowerCase())
            .single();
            data = publicData;
        } else if (session?.user) {
            // Private Dashboard
            const { data: privateData } = await supabase
            .from('creator_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            data = privateData;
        }

        if (data) {
            setProfile(data);
            // Fetch items using the ID from the profile we just got
            const items = await getWishlistItems(data.id);
            setWishlist(items || []);
        }
        } catch (err) {
        console.error("Fetch error:", err);
        } finally {
        setLoading(false); // Stop loading even if there's an error
        }
    };

    loadProfile();
  }, [username, session?.user?.id]); // Watch these two specifically

  const handleAddToCart = async (item) => {
    try {
      let cleanPrice = item.price;
      if (typeof cleanPrice === 'string') {
        cleanPrice = parseFloat(cleanPrice.replace(/[^\d.]/g, ''));
      }
      const finalPrice = isNaN(cleanPrice) ? 0 : cleanPrice;
      
      const itemWithCurrency = {
        ...item,
        price: finalPrice,
        added_currency: currency.code,
        added_rate: currency.rate,
        recipient_id: session.user.id,
        addedAt: new Date().getTime()
      };

      const existingCart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]');
      localStorage.setItem('wishlist_cart', JSON.stringify([...existingCart, itemWithCurrency]));
      
      window.dispatchEvent(new Event('cartUpdated'));
      setToastMsg(`Added to cart in ${currency.code}! 🎁`);
      setShowToast(true);
    } catch (err) {
      setToastMsg("Failed to add to cart.");
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (session) loadData();
  }, [session]);
  
  if (loading || !profile) {
    return isOwner ? <div className="loading-state">Loading your profile...</div> : <div className="loading-state">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-modern-page">
      <header className="wishlist-hero-card">
        <div className="hero-flex">
          {profile?.avatar_url && (
            <div className="profile-avatar-wrapper">
                <img 
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.display_name || 'User'}`} 
                    alt={profile?.display_name} 
                    className="profile-avatar-img"
                    onError={(e) => { 
                        // Prevent infinite loops by checking if we already tried the fallback
                        if (e.target.src !== 'https://api.dicebear.com/7.x/initials/svg?seed=User') {
                        e.target.onerror = null; // Unbind the handler
                        e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
                        }
                    }} 
                />
                {isOwner && (
                    <button className="avatar-edit-pencil" onClick={() => setEditingProfile(true)}>
                    <Pencil size={18} color="white" /> 
                    </button>
                )}
            </div>
          )}
          <div className="user-branding">
            <h1 className="user-name-title">
              {profile?.display_name || 'My Wishlist'} 
              <span className="handle">@{profile?.username}</span>
            </h1>
            <div className="bio-container">
                <p className="creator-bio-text">
                {profile?.bio || "Add a bio to tell your fans about yourself! ✨"}
                </p>
            </div>
            <div className="hero-stats">
              <span>{wishlist.length || 0} items</span>
              <span className="dot"></span>
              <span>
                {currency.code === 'INR' ? '₹' : currency.code + ' '}
                {/* Calculate total value directly from the wishlist array */}
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
          
          <div className="header-actions-group">
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

            <button className="modern-share-btn" onClick={() => {
                const shareUrl = `${window.location.origin}/wishlist/${profile?.username}`;
                navigator.clipboard.writeText(shareUrl);
                setToastMsg("Link copied! 🔗");
                setShowToast(true);
            }}>
              <Share2 size={18} /> Share List
            </button>
          </div>
        </div>
      </header>

      <section className="modern-controls-container">
        <div className="search-bar-wrapper">
          <Search size={20} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search for an item..." 
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
          {isOwner && <AddWishlistItem session={session} onItemAdded={loadData} categories={[]} currency={currency} />}
        </div>
      </section>

      <main className="wishlist-display-area">
        <div className={`wishlist-container-${viewMode}`}>
            {wishlist
                .filter(item => (item.name || item.title).toLowerCase().includes(searchQuery.toLowerCase()))
                .map(item => (
                    <WishlistItemCard 
                    key={item.id} 
                    item={item} 
                    isOwner={isOwner} // <--- THIS MUST BE THE isOwner WE CALCULATED
                    onDelete={(id) => deleteWishlistItem(id).then(loadData)} 
                    onAddToCart={() => handleAddToCart(item)}
                    username={profile?.username}
                    onEdit={(item) => setEditingItem(item)}
                    currencySettings={currency}
                    />
            ))}
        </div>
      </main>

      {/* 🚀 FIXED: Profile Edit Modal Added Here */}
      {editingProfile && (
        <div className="edit-overlay">
            <div className="edit-modal">
            <div className="modal-header">
                <h3>Update Your Profile</h3>
                <button onClick={() => setEditingProfile(false)} className="close-btn">×</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 🚀 IMAGE UPLOAD SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div className="profile-upload-section">
                    <div className="modal-avatar-preview">
                        <img 
                        src={profile?.avatar_url || 'https://via.placeholder.com/100'} 
                        alt="Preview" 
                        className={uploading ? 'loading-avatar' : ''}
                        />
                        {uploading && <div className="avatar-spinner">...</div>}
                    </div>
                    
                    <label className="custom-file-upload">
                        {uploading ? 'Uploading...' : 'Change Photo'}
                        <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={uploading}
                        style={{ display: 'none' }} 
                        />
                    </label>
                    </div>
                </div>

                <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Display Name</label>
                <input 
                    className="modern-search-input"
                    style={{ paddingLeft: '16px !important' }}
                    value={tempProfile.display_name}
                    onChange={(e) => setTempProfile({...tempProfile, display_name: e.target.value})}
                />
                </div>
                
                <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Bio</label>
                <textarea 
                    className="modern-search-input"
                    style={{ paddingLeft: '16px !important', minHeight: '80px', resize: 'none' }}
                    value={tempProfile.bio}
                    onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                />
                </div>

                <button onClick={handleUpdateProfile} className="btn-main-action" style={{ width: '100%', padding: '14px' }}>
                Save Changes
                </button>
            </div>
            </div>
        </div>
      )}

      {/* Existing Edit Item Modal */}
      {editingItem && (
        <div className="edit-overlay">
            <div className="edit-modal">
            <div className="modal-header">
                <h3>Edit Your Wish</h3>
                <button 
                onClick={(e) => {
                    e.preventDefault(); // Stop any form actions
                    setEditingItem(null); 
                }}
                className="close-btn"
                >
                ×
                </button>
            </div>
            <AddWishlistItem 
                session={session} 
                onItemAdded={() => {
                loadData();        // Refresh the list
                setEditingItem(null); // CLOSE the modal after saving
                }} 
                initialData={editingItem} 
                isEditing={true}
                currency={currency}
            />
            </div>
        </div>
      )}

      {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
}