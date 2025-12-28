import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import { 
  LayoutDashboard, 
  Gift, 
  Share2, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  
  const [profile, setProfile] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!session?.user?.id) return;
      
      try {
        const { data: profileData } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const { count } = await supabase
          .from('wishlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', session.user.id);

        setProfile(profileData);
        setWishlistCount(count || 0);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [session]);

  // Dashboard.jsx - Update checklistItems
  const checklistItems = [
    {
      id: 'avatar',
      label: 'Upload Profile Photo',
      isDone: !!profile?.avatar_url,
      action: () => navigate(`/${profile?.username}`, { state: { trigger: 'editProfile' } }) // 👈 Pass state
    },
    {
      id: 'banner',
      label: 'Add a Cover Banner',
      isDone: !!profile?.banner_url,
      action: () => navigate(`/${profile?.username}`, { state: { trigger: 'editProfile' } }) // 👈 Pass state
    },
    {
      id: 'bio',
      label: 'Write your Bio',
      isDone: !!profile?.bio && profile.bio.length > 5,
      action: () => navigate(`/${profile?.username}`, { state: { trigger: 'editProfile' } }) // 👈 Pass state
    },
    {
      id: 'item',
      label: 'Add your first gift item',
      isDone: wishlistCount > 0,
      action: () => navigate(`/${profile?.username}`, { state: { trigger: 'addItem' } }) // 👈 Pass state
    }
  ];

  const completedSteps = checklistItems.filter(item => item.isDone).length;
  const progressPercent = (completedSteps / checklistItems.length) * 100;

  // 🚀 REDIRECT LOGIC: Navigate to wishlist if 100% complete
  useEffect(() => {
    if (!loading && profile && progressPercent === 100) {
      showToast("Profile complete! Opening your Peti... ✨");
      navigate(`/${profile.username}`);
    }
  }, [loading, progressPercent, profile, navigate, showToast]);

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${profile?.username}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard! 📋");
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div style={dashboardContainer}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Welcome back, {profile?.display_name || 'Creator'}! 👋</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Here is what's happening with your Peti.</p>
        </div>
        <button 
          onClick={() => navigate(`/${profile?.username}`)}
          style={viewProfileBtn}
        >
          <LayoutDashboard size={18} /> View Public Peti
        </button>
      </header>

      {/* 🚀 GETTING STARTED SECTION */}
      {progressPercent < 100 && (
        <section style={checklistCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Finish setting up your Peti <span style={badgeStyle}>{completedSteps}/{checklistItems.length}</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Complete these steps to start receiving gifts from fans.</p>
            </div>
            <div style={progressCircleContainer}>
               <svg width="50" height="50">
                 <circle cx="25" cy="25" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                 <circle cx="25" cy="25" r="20" fill="none" stroke="#6366f1" strokeWidth="4" 
                   strokeDasharray={`${progressPercent * 1.25}, 125`} 
                   style={{ transition: 'stroke-dasharray 0.5s ease' }}
                 />
               </svg>
               <span style={progressText}>{Math.round(progressPercent)}%</span>
            </div>
          </div>

          <div style={stepsGrid}>
            {checklistItems.map((step) => (
              <div 
                key={step.id} 
                onClick={step.action}
                style={{
                  ...stepItem,
                  borderColor: step.isDone ? '#10b981' : '#e2e8f0',
                  backgroundColor: step.isDone ? '#f0fdf4' : 'white'
                }}
              >
                {step.isDone ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : (
                  <Circle size={20} color="#cbd5e1" />
                )}
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: step.isDone ? '#166534' : '#1e293b',
                  flex: 1 
                }}>
                  {step.label}
                </span>
                {!step.isDone && <ArrowRight size={14} color="#94a3b8" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🔗 QUICK SHARE SECTION */}
      <section style={shareCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Share2 size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px' }}>Share Your Link</h3>
        </div>
        <div style={linkBox}>
          <code style={codeStyle}>wishpeti.com/{profile?.username}</code>
          <button onClick={copyToClipboard} style={copyBtn}>
            <Copy size={16} /> Copy
          </button>
        </div>
      </section>

      {/* QUICK STATS */}
      <div style={statsGrid}>
        <div style={statCard}>
          <Gift color="#6366f1" size={24} />
          <div style={{ marginTop: '12px' }}>
            <span style={statLabel}>Items in Peti</span>
            <div style={statValue}>{wishlistCount}</div>
          </div>
        </div>
        <div style={statCard}>
          <Share2 color="#f59e0b" size={24} />
          <div style={{ marginTop: '12px' }}>
            <span style={statLabel}>Total Contributions</span>
            <div style={statValue}>₹0</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const dashboardContainer = { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };
const viewProfileBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' };

const checklistCard = { backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const badgeStyle = { backgroundColor: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', marginLeft: '8px' };

const shareCard = { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px dashed #cbd5e1', marginBottom: '32px' };
const linkBox = { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', background: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const codeStyle = { flex: 1, fontFamily: 'monospace', fontSize: '14px', color: '#1e293b' };
const copyBtn = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };

const stepsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' };
const stepItem = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s ease' };

const progressCircleContainer = { position: 'relative', width: '50px', height: '50px' };
const progressText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '11px', fontWeight: 'bold' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const statCard = { padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' };
const statLabel = { fontSize: '13px', color: '#64748b', fontWeight: '600' };
const statValue = { fontSize: '28px', fontWeight: '800', color: '#1e293b', marginTop: '4px' };