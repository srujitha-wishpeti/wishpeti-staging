import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../context/ToastContext';
import AvatarUpload from '../pages/AvatarUpload';
import BannerUpload from '../pages/BannerUpload';
import { ShieldCheck, Lock, MapPin, CheckCircle } from 'lucide-react'; // Added icons

export default function OnBoarding() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const showToast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    full_name: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    country_code: '+91', // Default to India
  });
  
  // 2. Define common country codes
  const countryCodes = [
    { code: '+91', label: '🇮🇳 +91' },
    { code: '+1', label: '🇺🇸 +1' },
    { code: '+44', label: '🇬🇧 +44' },
    { code: '+971', label: '🇦🇪 +971' },
  ];
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData({
            username: data.username || '',
            display_name: data.display_name || '',
            avatar_url: data.avatar_url || '',
            banner_url: data.banner_url || '', 
            bio: data.bio || '',
            country_code: data.country_code || '',
            phone: data.phone || '',
            full_name: data.full_name || '',
            address_line1: data.address_line1 || '',
            city: data.city || '',
            state: data.state || '',
            postal_code: data.postal_code || '',
            country: data.country || 'India',
          });

          if (data.username && data.username.trim() !== "") {
            setIsExistingUser(true);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      } finally {
        setFetching(false);
      }
    };

    if (!authLoading && session) {
      fetchProfile();
    } else if (!authLoading && !session) {
      setFetching(false);
    }
  }, [session, authLoading]);

  const [usernameError, setUsernameError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUsernameError('');

    try {
        const cleanUsername = formData.username.toLowerCase().trim();

        if (!isExistingUser) {
            const { data: taken } = await supabase
            .from('creator_profiles')
            .select('username')
            .eq('username', cleanUsername)
            .not('id', 'eq', session.user.id)
            .maybeSingle();

            if (taken) {
                alert("This username is already taken. Please pick another.");
                setLoading(false);
                return;
            }
        }

        const { error } = await supabase
        .from('creator_profiles')
        .upsert({
            id: session.user.id,
            avatar_url: formData.avatar_url,
            banner_url: formData.banner_url,
            username: cleanUsername,
            display_name: formData.display_name,
            bio: formData.bio,
            country_code: formData.country_code,
            phone: formData.phone,
            full_name: formData.full_name,
            address_line1: formData.address_line1,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country
        });

        if (error) throw error;
        showToast("Profile secured! Welcome to WishPeti 🚀");
        navigate('/dashboard');
    } catch (err) {
        alert("Error saving profile: " + err.message);
    } finally {
        setLoading(false);
    }
  };
  
  const handlePincodeChange = async (e) => {
    const pin = e.target.value;
    setFormData({ ...formData, postal_code: pin });

    if (pin.length === 6) {
        try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        
        if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
            ...prev,
            postal_code: pin,
            city: postOffice.District,
            state: postOffice.State
            }));
            showToast("Location detected! ✨");
        }
        } catch (err) {
            console.error("Pincode lookup failed");
        }
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("This will PERMANENTLY delete your account. Continue?");
    if (confirm) {
      setLoading(true);
      try {
        const { error } = await supabase.rpc('delete_user_full_account');
        if (error) throw error;
        await supabase.auth.signOut();
        navigate('/');
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading || fetching) {
    return <div style={{ marginTop: '120px', textAlign: 'center' }}>Loading your profile...</div>;
  }

  return (
    <div className="onboarding-container" style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Setup Your Profile</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Finalize your identity to start receiving gifts from fans.
            </p>
        </div>

        <BannerUpload 
            url={formData.banner_url} 
            onUpload={(url) => setFormData({ ...formData, banner_url: url })} 
        />

        <AvatarUpload 
            url={formData.avatar_url} 
            onUpload={(url) => setFormData({ ...formData, avatar_url: url })} 
        />

        <form onSubmit={handleSubmit}>
          {/* PROFILE SECTION */}
          <label style={labelStyle}>Public Display Name</label>
          <input
            type="text"
            placeholder="e.g. Sarah Cooks"
            required
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Wishlist Username</label>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}>@</span>
            <input
                disabled={isExistingUser}
                type="text"
                value={formData.username}
                onChange={(e) => {
                    setUsernameError('');
                    setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') });
                }}
                style={{ 
                    ...inputStyle, 
                    paddingLeft: '30px', 
                    marginBottom: '0',
                    backgroundColor: isExistingUser ? '#f8fafc' : 'white'
                }}
            />
          </div>
          {isExistingUser && (
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', marginBottom: '15px' }}>
              Username is locked to keep your public links active.
            </p>
          )}

          <label style={labelStyle}>Bio</label>
          <textarea
              placeholder="Tell fans about yourself..."
              value={formData.bio} 
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
              maxLength={160}
              style={{ ...inputStyle, height: '80px', resize: 'none' }}
          />

          <hr style={dividerStyle} />

          {/* SHIPPING SECTION WITH PRIVACY FOCUS */}
          <div style={privacyHeaderStyle}>
             <ShieldCheck size={20} color="#10b981" />
             <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Private Shipping Address</h3>
          </div>

          <div style={privacyBannerStyle}>
            <p style={{ margin: 0 }}>
              <strong>🔒 Privacy Guaranteed:</strong> Fans only see your wishlist. Your real name and address are strictly used for delivery coordination.
            </p>
          </div>

          {/* 🔑 PHONE NUMBER FIRST */}
          <label style={labelStyle}>Contact Number (Required for Courier)</label>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', // Explicitly force row
            gap: '10px', 
            marginBottom: '18px',
            width: '100%' 
          }}>
            <select 
              value={formData.country_code} 
              onChange={e => setFormData({...formData, country_code: e.target.value})}
              style={{ 
                ...inputStyle, 
                width: '120px',      // Fixed width
                minWidth: '120px',   // Force it not to grow
                flex: '0 0 120px',   // Don't grow, don't shrink, stay at 120px
                marginBottom: 0,
                padding: '12px 4px'
              }}
            >
              {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>

            <input 
              type="tel" 
              placeholder="10-digit mobile number" 
              required 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
              style={{ 
                ...inputStyle, 
                flex: '1',           // This will take the rest of the 100% width
                minWidth: '0',       // Important for flex children to shrink/fit correctly
                marginBottom: 0 
              }} 
            />
          </div>


          <label style={labelStyle}>Recipient Full Name</label>
          <input
            type="text"
            placeholder="Legal name for delivery"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Street Address</label>
          <input
            type="text"
            placeholder="House No, Building, Street"
            required
            value={formData.address_line1}
            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pincode</label>
              <input
                  type="text"
                  maxLength="6"
                  required
                  value={formData.postal_code}
                  onChange={handlePincodeChange}
                  style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Country</label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                style={inputStyle}
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Securing Profile...' : 'Complete My Profile'}
          </button>
        </form>

        <div style={dangerZoneStyle}>
          <button type="button" onClick={handleDeleteAccount} style={deleteBtnStyle}>
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const containerStyle = { paddingTop: '60px', paddingBottom: '80px', backgroundColor: '#f8fafc', minHeight: '100vh' };
const cardStyle = { maxWidth: '540px', margin: '0 auto', background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' };
const inputStyle = { 
  width: '100%', padding: '12px 16px', marginBottom: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', 
  boxSizing: 'border-box', fontSize: '16px', backgroundColor: '#fff', color: '#0f172a', transition: 'all 0.2s ease'
};
const btnStyle = { 
  width: '100%', padding: '16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', 
  fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
};
const dividerStyle = { margin: '32px 0', border: '0', borderTop: '1px solid #f1f5f9' };
const privacyHeaderStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' };
const privacyBannerStyle = { 
  backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '12px', border: '1px solid #dcfce7', 
  fontSize: '0.8rem', color: '#166534', marginBottom: '24px', lineHeight: '1.5' 
};
const dangerZoneStyle = { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' };
const deleteBtnStyle = { background: 'none', color: '#94a3b8', border: 'none', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' };