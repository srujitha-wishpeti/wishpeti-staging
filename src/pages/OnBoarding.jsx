import { useState, useEffect } from 'react'; // 🔑 Added useEffect
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Onboarding() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // 🔑 Added to show a loader while fetching data
  
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    full_name: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  // 🔑 NEW: Fetch existing data on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setFormData({
            username: data.username || '',
            display_name: data.display_name || '',
            full_name: data.full_name || '',
            address_line1: data.address_line1 || '',
            city: data.city || '',
            state: data.state || '',
            postal_code: data.postal_code || '',
            country: data.country || 'India',
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setFetching(false);
      }
    };

    if (!authLoading && session) {
      fetchProfile();
    }
  }, [session, authLoading]);

  if (authLoading || fetching) return <div style={{ marginTop: '120px', textAlign: 'center' }}>Loading profile details...</div>;

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Permanently delete your account? This will wipe your wishlist and shipping info. This cannot be undone.");
    
    if (confirm) {
        setLoading(true);
        try {
        // 1. Delete the profile row (Items should delete via Cascade if setup)
        const { error } = await supabase
            .from('creator_profiles')
            .delete()
            .eq('id', session.user.id);

        if (error) throw error;

        // 2. Sign out and redirect
        await supabase.auth.signOut();
        navigate('/');
        } catch (err) {
        alert("Error: " + err.message);
        } finally {
        setLoading(false);
        }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('creator_profiles')
      .update({
        username: formData.username.toLowerCase().trim(),
        display_name: formData.display_name,
        full_name: formData.full_name,
        address_line1: formData.address_line1,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
      })
      .eq('id', session.user.id);

    if (error) {
        alert("Error saving profile: " + error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-container" style={{ paddingTop: '80px', paddingBottom: '50px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '8px' }}>✨ Update Your Profile</h2>
        <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>Update your identity and shipping details.</p>
        
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Public Display Name</label>
          <input 
            type="text" 
            placeholder="e.g. Sarah Cooks" 
            required
            value={formData.display_name} // 🔑 Added value
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            style={inputStyle}
          />

          <label style={labelStyle}>Wishlist Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }}>@</span>
            <input 
              disabled={!!formData.username}
              type="text" 
              placeholder="username" 
              required
              value={formData.username} // 🔑 Added value
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={{ ...inputStyle, paddingLeft: '30px' }}
            />
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

          <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>🚚 Private Shipping Details</h3>
          
          <input 
            type="text" 
            placeholder="Real Full Name" 
            required
            value={formData.full_name} // 🔑 Added value
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            style={inputStyle}
          />
          
          <input 
            type="text" 
            placeholder="Street Address" 
            required
            value={formData.address_line1} // 🔑 Added value
            onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" placeholder="City" required
              value={formData.city} // 🔑 Added value
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              style={inputStyle}
            />
            <input 
              type="text" placeholder="State" required
              value={formData.state} // 🔑 Added value
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" placeholder="Pincode" required
              value={formData.postal_code} // 🔑 Added value
              onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
              style={inputStyle}
            />
            <select 
              required
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              style={inputStyle}
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Saving Changes...' : 'Update Profile ✅'}
          </button>
        </form>
      </div>
      <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #fee2e2', borderRadius: '12px', backgroundColor: '#fef2f2' }}>
        <h4 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>Danger Zone</h4>
        <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '15px' }}>
            Deleting your account will remove your public wishlist and all saved shipping data.
        </p>
        <button 
            type="button" 
            onClick={handleDeleteAccount}
            style={{ width: '100%', padding: '10px', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
            Delete Account
        </button>
        </div>
    </div>
  );
}

// ... (Styles remain the same as previous)
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px', color: '#374151' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginBottom: '20px' };