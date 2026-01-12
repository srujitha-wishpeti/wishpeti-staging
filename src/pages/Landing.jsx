import { supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';
import { FoundingBadge, VerifiedBadge } from '../components/ui/Badges';

import React, { useEffect, useState } from 'react';

export default function Landing() {
  const showToast = useToast();
  const [featuredCreators, setFeaturedCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('username, display_name, avatar_url, banner_url, bio, is_founding_member, is_verified')
        .not('username', 'is', null)
        .not('display_name', 'is', null)
        .eq('is_profile_claimed', true)
        .limit(4)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setFeaturedCreators(data);
      }
      setLoading(false);
    };

    fetchFeatured();

    const channel = supabase
      .channel('landing-public-activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const name = payload.new.is_anonymous ? "Someone" : (payload.new.buyer_name || "A fan");
          showToast(`✨ ${name} just fulfilled a gift for a creator!`);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showToast]);

  // Updated Redirect Function
  const handleGetStarted = () => {
    window.location.href = '/auth?mode=login';
  };

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#1a202c' }}>
      {/* HERO SECTION */}
      <div style={{ padding: '80px 32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>
          The Safest Way for Digital Creators to Receive Real Support from their Community. 🎁
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4a5568', lineHeight: '1.6', marginBottom: '32px' }}>
          Build your WishPeti in minutes. Let your audience help fund your tools, creative work, or causes, while keeping your personal details private.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={handleGetStarted} 
            style={primaryBtnStyle}
          >
            Get Started
          </button>
          
          <a 
            href="#how-it-works" 
            style={secondaryBtnStyle}
          >
            How it Works
          </a>
        </div>
      </div>

      {/* DYNAMIC COMMUNITY SPOTLIGHTS */}
      {!loading && featuredCreators.length > 0 && (
        <div style={{ padding: '60px 32px', textAlign: 'center', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Active Community Members</h2>
          <p style={{ color: '#64748b', marginBottom: '40px' }}>Meet the creators receiving support from their supporters.</p>
          
          <div style={gridContainerStyle}>
            {featuredCreators.map((creator) => (
              <div key={creator.username} style={profileCardStyle}>
                <div style={profileBannerSmall}>
                  {creator.banner_url && (
                    <img src={creator.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="banner" />
                  )}
                </div>

                <div style={avatarPositioner}>
                  <div style={profileAvatarWrapper}>
                    {creator.avatar_url ? (
                      <img 
                        src={creator.avatar_url} 
                        style={profileAvatarStyle} 
                        alt={creator.display_name} 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{
                      ...profileAvatarStyle,
                      display: creator.avatar_url ? 'none' : 'flex',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {creator.display_name?.charAt(0) || creator.username?.charAt(0)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 15px 20px 15px', textAlign: 'center' }}>
                  {/* Flex container ensures name and badges stay on one aligned line */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    marginBottom: '4px' ,
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {creator.display_name}
                    </h3>
                    {/* Container for Badges ensures they stay perfectly aligned with name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {creator.is_verified && <VerifiedBadge />}
                    </div>
                  </div>
                  <p style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
                    @{creator.username}
                  </p>
                  <a href={`/${creator.username}`} style={viewProfileBtn}>
                    View WishPeti
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW IT WORKS SECTION */}
      <div id="how-it-works" style={{ padding: '80px 32px', backgroundColor: '#f7fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '48px' }}>How it Works</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={stepCardStyle}>
            <div style={numberCircle}>1</div>
            <h3>Create your Peti</h3>
            <p>Add the items, tools or resources you actually want from any online store.</p>
          </div>
          <div style={stepCardStyle}>
            <div style={numberCircle}>2</div>
            <h3>Share your Link</h3>
            <p>Add your unique WishPeti link to your social media bios.</p>
          </div>
          <div style={stepCardStyle}>
            <div style={numberCircle}>3</div>
            <h3>Receive Privately</h3>
            <p>Your community supports you; we ship items to you without revealing your address.</p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div style={{ padding: '80px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '40px' }}>Common Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={faqItemStyle}>
            <h4 style={faqQuestionStyle}>Is my address really private?</h4>
            <p style={faqAnswerStyle}>Absolutely. Your shipping address is never revealed to your community. Our secure delivery service ensures your home remains your private sanctuary.</p>
          </div>
          <div style={faqItemStyle}>
            <h4 style={faqQuestionStyle}>How do I get paid?</h4>
            <p style={faqAnswerStyle}>For cash support, we use Razorpay's secure infrastructure to transfer funds directly to your linked account.</p>
          </div>
          <div style={faqItemStyle}>
            <h4 style={faqQuestionStyle}>What platforms does this work with?</h4>
            <p style={faqAnswerStyle}>Everywhere! You can add your WishPeti link to your bio on Instagram, TikTok, YouTube, Twitch, or X (Twitter).</p>
          </div>
          <div style={faqItemStyle}>
            <h4 style={faqQuestionStyle}>Are there any fees?</h4>
            <p style={faqAnswerStyle}>Setting up your WishPeti is 100% free. We only take a small platform fee on cash contributions to keep the lights on.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// STYLES 
const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
  justifyItems: 'center',
  maxWidth: '1100px',
  margin: '0 auto'
};

const profileCardStyle = {
  width: '100%',
  maxWidth: '250px',
  backgroundColor: '#fff',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  textAlign: 'center',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
};

const profileBannerSmall = { height: '90px', backgroundColor: '#f1f5f9', width: '100%' };

const avatarPositioner = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '-35px',
  marginBottom: '10px',
  position: 'relative',
  zIndex: 10
};

const profileAvatarWrapper = { padding: '4px', backgroundColor: '#fff', borderRadius: '50%', display: 'inline-block' };

const profileAvatarStyle = {
  width: '65px',
  height: '65px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid white',
  backgroundColor: '#f1f5f9'
};

const primaryBtnStyle = { padding: '12px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const secondaryBtnStyle = { padding: '12px 24px', backgroundColor: '#fff', color: '#000', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' };
const viewProfileBtn = { display: 'block', padding: '10px', backgroundColor: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', marginTop: 'auto' };

const stepCardStyle = { flex: '1', minWidth: '250px', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left' };
const numberCircle = { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontWeight: 'bold' };

const faqItemStyle = { padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' };
const faqQuestionStyle = { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c' };
const faqAnswerStyle = { margin: 0, color: '#4a5568', lineHeight: '1.5' };