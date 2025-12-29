import { supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';
import React, { useEffect, useState } from 'react';

export default function Landing() {
  const showToast = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('landing-public-activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // We don't need to show the exact amount for privacy on a landing page
          // Just a "Someone just sent a gift" message
          const name = payload.new.is_anonymous ? "Someone" : (payload.new.buyer_name || "A fan");
          showToast(`✨ ${name} just fulfilled a gift for a creator!`);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showToast]);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#1a202c' }}>
      {/* HERO SECTION */}
      <div style={{ padding: '80px 32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>
          The Safest Way for Digital Creators to Receive Real Support from their Community. 🎁
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4a5568', lineHeight: '1.6', marginBottom: '32px' }}>
          Build your WishPeti in minutes. Let your audience help fund your tools, creative work, or causes, while keeping your personal details private. Trusted by top influencers to bridge the gap between creators and their community safely.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={login} 
            style={{ padding: '12px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Get Started
          </button>
          
          {/* This link points to the ID below */}
          <a 
            href="#how-it-works" 
            style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#000', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
          >
            How it Works
          </a>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div id="how-it-works" style={{ padding: '80px 32px', backgroundColor: '#f7fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '48px' }}>How it Works</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={stepCardStyle}>
            <div style={numberCircle}>1</div>
            <h3>Create your Peti</h3>
            <p>Add the items, tooks or resources you actually want from any online store.</p>
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
            <p style={faqAnswerStyle}>Yes. Your Community never see your shipping address. We provide a secure middle-man service to ensure your doorstep remains your private space.</p>
          </div>

          <div style={faqItemStyle}>
            <h4 style={faqQuestionStyle}>How do I get paid?</h4>
            <p style={faqAnswerStyle}>For cash gifts, we use Razorpay's secure infrastructure to transfer funds directly to your linked account.</p>
          </div>

          <div style={faqItemStyle}>
            <h4 style={faqQuestionStyle}>What platforms does this work with?</h4>
            <p style={faqAnswerStyle}>Everywhere! You can put your WishPeti link in your bio on Instagram, TikTok, YouTube, Twitch, or X (Twitter).</p>
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

// Simple styles for the cards
const stepCardStyle = {
  flex: '1',
  minWidth: '250px',
  padding: '24px',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  textAlign: 'left'
};

const numberCircle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#4f46e5',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  fontWeight: 'bold'
};

const faqItemStyle = {
  padding: '20px',
  borderRadius: '12px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0'
};

const faqQuestionStyle = {
  margin: '0 0 10px 0',
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#1a202c'
};

const faqAnswerStyle = {
  margin: 0,
  color: '#4a5568',
  lineHeight: '1.5'
};