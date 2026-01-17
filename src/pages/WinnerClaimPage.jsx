import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Gift, ArrowRight, ShieldCheck, Truck, Loader2 } from 'lucide-react';

export default function WinnerClaimPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const checkUserAndPrize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          creator_profiles!wishlist_items_creator_id_fkey (
            display_name
          )
        `)
        .eq('claim_token', token)
        .maybeSingle();

      if (error) console.error("Fetch error:", error);
      if (data) setItem(data);
      setLoading(false);
    };

    if (token) checkUserAndPrize();
  }, [token]);

  const handleFinalClaim = async () => {
    if (!user) return;
    setClaiming(true);
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({ 
          winner_id: user.id, 
          status: 'purchased', 
          claim_token: null    
        })
        .eq('claim_token', token);

      if (error) throw error;
      navigate('/onboarding?claimed=true');
    } catch (err) {
      alert("Error claiming prize: " + err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div style={centerStyle}><Loader2 className="animate-spin" /> Verifying gift...</div>;

  // FIX: Only show expired if item is missing OR if a winner_id is already set
  if (!item || item.winner_id) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎁</div>
          <h2 style={{color: '#1e293b', fontWeight: '800'}}>Link Expired</h2>
          <p style={{color: '#64748b', margin: '10px 0 20px'}}>This prize has already been claimed or the link is invalid.</p>
          <button onClick={() => navigate('/')} style={primaryBtn}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={badgeStyle}>CONGRATS! 🏆</div>
        
        {/* Updated to use 'image' from your DB */}
        {item.image && (
          <div style={prizeImageContainer}>
            <img src={item.image} alt={item.title} style={prizeImage} />
          </div>
        )}

        {/* Updated to use 'title' from your DB */}
        <h1 style={titleStyle}>You won {item.title}!</h1>
        
        <p style={descriptionStyle}>
          Gifted to you by <strong>{item.creator_profiles?.display_name || 'a Creator'}</strong>.
        </p>

        <div style={infoBox}>
          <div style={infoItem}><ShieldCheck size={16} color="#6366f1" /> Verified Giveaway</div>
          <div style={infoItem}><Truck size={16} color="#6366f1" /> Safe Shipping via WishPeti</div>
        </div>

        {user ? (
          <button onClick={handleFinalClaim} disabled={claiming} style={primaryBtn}>
            {claiming ? 'Claiming...' : 'Add to My Peti'} <ArrowRight size={18} />
          </button>
        ) : (
          <button 
            onClick={() => navigate(`/auth?mode=signup&claim_token=${token}`)} 
            style={primaryBtn}
          >
            Sign up to Claim Prize <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ... styles remain the same as your file ...
const containerStyle = { minHeight: '100vh', backgroundColor: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const cardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '28px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', boxSizing: 'border-box' };
const badgeStyle = { backgroundColor: '#EEF2FF', color: '#6366f1', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', display: 'inline-block', marginBottom: '20px' };
const prizeImageContainer = { width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '24px', overflow: 'hidden', border: '4px solid #F8FAFC' };
const prizeImage = { width: '100%', height: '100%', objectFit: 'cover' };
const titleStyle = { fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' };
const descriptionStyle = { color: '#64748b', fontSize: '14px', marginBottom: '24px' };
const infoBox = { backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'left' };
const infoItem = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '8px' };
const primaryBtn = { width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: '#1e293b', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const centerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' };