import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../context/ToastContext';
import AvatarUpload from '../pages/AvatarUpload';
import BannerUpload from '../pages/BannerUpload';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnBoarding() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [step, setStep] = useState(1); 
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
    country_code: '+91',
  });
  
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
          setFormData(prev => ({ ...prev, ...data }));
          if (data.username?.trim()) setIsExistingUser(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      } finally {
        setFetching(false);
      }
    };
    if (!authLoading && session) fetchProfile();
  }, [session, authLoading]);

  // Step 1: Save Profile Info (Required to move to Step 2)
  const saveStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanUsername = formData.username.toLowerCase().trim();
      const { error } = await supabase.from('creator_profiles').upsert({
        id: session.user.id,
        username: cleanUsername,
        display_name: formData.display_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        banner_url: formData.banner_url
      });
      if (error) throw error;
      setStep(2); 
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Save Shipping (Final Submit)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('creator_profiles').upsert({
        id: session.user.id,
        ...formData 
      });
      if (error) throw error;
      showToast("Profile fully setup! 🚀");
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
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
          setFormData(prev => ({ ...prev, city: postOffice.District, state: postOffice.State }));
        }
      } catch (err) { console.error("Pincode failed"); }
    }
  };

  if (authLoading || fetching) return <div style={{ marginTop: '120px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="onboarding-container" style={containerStyle}>
      <div style={cardStyle}>
        {/* Step Indicator */}
        <div style={progressContainer}>
            <div style={{...progressCircle, backgroundColor: '#6366f1', color: 'white'}}>1</div>
            <div style={{...progressLine, backgroundColor: step === 2 ? '#6366f1' : '#e2e8f0'}}></div>
            <div style={{...progressCircle, backgroundColor: step === 2 ? '#6366f1' : '#f1f5f9', color: step === 2 ? 'white' : '#94a3b8'}}>2</div>
        </div>

        {step === 1 ? (
          <form onSubmit={saveStep1}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>Create Your Identity</h2>
                <p style={{ color: '#64748b' }}>Choose how supporters will see you.</p>
            </div>

            {/* STACKED HEADER (NO OVERLAP) */}
            <div style={{ marginBottom: '20px' }}>
              <BannerUpload url={formData.banner_url} onUpload={(url) => setFormData({ ...formData, banner_url: url })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <AvatarUpload url={formData.avatar_url} onUpload={(url) => setFormData({ ...formData, avatar_url: url })} />
            </div>

            <label style={labelStyle}>Public Display Name</label>
            <input type="text" required placeholder="Display Name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Username</label>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <span style={{ position: 'absolute', left: '14px', top: '13px', color: '#94a3b8' }}>@</span>
                <input disabled={isExistingUser} type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })} style={{ ...inputStyle, paddingLeft: '34px' }} />
            </div>

            <label style={labelStyle}>Bio</label>
            <textarea placeholder="Tell supporters about yourself..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} maxLength={160} style={{ ...inputStyle, height: '100px', resize: 'none' }} />

            <button type="submit" disabled={loading} style={btnStyle}>
                Continue to Shipping <ArrowRight size={18} style={{marginLeft: '8px'}} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>Shipping Details</h2>
                <p style={{ color: '#64748b' }}>This can be completed now or later.</p>
            </div>

            <div style={privacyBannerStyle}>
                <ShieldCheck size={20} style={{marginRight: '12px', flexShrink: 0}} />
                <span>Addresses are 100% private and never shown to supporters.</span>
            </div>

            <label style={labelStyle}>Phone Number</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <select value={formData.country_code} onChange={e => setFormData({...formData, country_code: e.target.value})} style={{ ...inputStyle, width: '100px', flex: '0 0 100px', marginBottom: 0 }}>
                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input type="tel" required placeholder="Mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            </div>

            <label style={labelStyle}>Recipient Full Name</label>
            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Street Address</label>
            <input type="text" required value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} style={inputStyle} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Pincode</label>
                <input type="text" placeholder="6-digit" required maxLength="6" value={formData.postal_code} onChange={handlePincodeChange} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>City</label>
                <input type="text" required value={formData.city} style={{...inputStyle, backgroundColor: '#f8fafc'}} readOnly />
              </div>
            </div>

            <button type="submit" disabled={loading} style={btnStyle}>Save & Complete</button>
            
            {/* SKIP BUTTON: Only appears in Step 2 */}
            <button type="button" onClick={() => navigate('/dashboard')} style={skipBtnStyle}>
                I'll complete this later
            </button>
            
            <button type="button" onClick={() => setStep(1)} style={backBtnStyle}>
                <ArrowLeft size={16} /> Back to Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// STYLES
const containerStyle = { paddingTop: '60px', paddingBottom: '80px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' };
const cardStyle = { width: '100%', maxWidth: '600px', background: 'white', padding: '40px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '14px 16px', marginBottom: '20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '16px', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' };
const btnStyle = { width: '100%', padding: '16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const skipBtnStyle = { width: '100%', background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '14px', borderRadius: '14px', marginTop: '12px', cursor: 'pointer', fontWeight: '600' };
const backBtnStyle = { width: '100%', border: 'none', background: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const privacyBannerStyle = { backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '14px', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', marginBottom: '24px', border: '1px solid #dcfce7' };
const progressContainer = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '12px' };
const progressCircle = { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const progressLine = { width: '60px', height: '3px' };