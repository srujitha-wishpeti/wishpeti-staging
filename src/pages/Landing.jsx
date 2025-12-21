import { supabase } from '../services/supabaseClient'

export default function Landing() {
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
          The Safest Way for Digital Creators to Receive Gifts. 🎁
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4a5568', lineHeight: '1.6', marginBottom: '32px' }}>
          Build your WishPeti in minutes. Receive physical gifts or secure payments while keeping your personal address and identity 100% private. Trusted by top influencers to bridge the gap between creators and fans safely.
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
            <p>Add the gifts you actually want from any online store.</p>
          </div>

          <div style={stepCardStyle}>
            <div style={numberCircle}>2</div>
            <h3>Share your Link</h3>
            <p>Add your unique WishPeti link to your social media bios.</p>
          </div>

          <div style={stepCardStyle}>
            <div style={numberCircle}>3</div>
            <h3>Receive Privately</h3>
            <p>Fans buy gifts; we ship them to you without revealing your address.</p>
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