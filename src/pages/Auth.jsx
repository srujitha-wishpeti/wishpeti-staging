import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext'; 
import './Auth.css';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const showToast = useToast(); 

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode') || 'signup';
  const claimUsername = params.get('claim'); // Detect marketing claim

  // --- Styles (Existing Styles Maintained) ---
  const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '20px' };
  const cardStyle = { width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };
  const errorStyle = { backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', border: '1px solid #fee2e2' };
  const googleBtnStyle = { width: '100%', padding: '12px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s' };
  const dividerContainer = { display: 'flex', alignItems: 'center', margin: '24px 0' };
  const lineStyle = { flex: 1, height: '1px', backgroundColor: '#e5e7eb' };
  const primaryBtnStyle = { width: '100%', padding: '14px', backgroundColor: loading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', backgroundColor: 'white', color: '#111827', WebkitTextFillColor: '#111827', pointerEvents: loading ? 'none' : 'auto' };

  const [isSignup, setIsSignup] = useState(mode === 'signup' || !!claimUsername);
  
  useEffect(() => {
    if (claimUsername) {
        setUsername(claimUsername);
        setIsSignup(true); // Force signup for claiming
    } else {
        setIsSignup(mode === 'signup');
    }
  }, [mode, claimUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        // If not claiming, check for existing user normally
        if (!claimUsername) {
            const { data: existingUser } = await supabase
              .from('creator_profiles')
              .select('username, is_profile_claimed')
              .ilike('username', username)
              .maybeSingle();

            if (existingUser && existingUser.is_profile_claimed) {
              setError("This username is already taken.");
              setLoading(false);
              return;
            }
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.toLowerCase() } // Pass to metadata for onboarding
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          showToast("Account created! Let's verify your reserved profile. 🎁");
          setTimeout(() => { navigate('/onboarding'); }, 500);
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        showToast("Welcome back!");
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
            {claimUsername ? 'Claim Your Profile' : (isSignup ? 'Create Account' : 'Welcome Back')}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            {claimUsername ? `Secure @${claimUsername} and your pre-filled items.` : (isSignup ? 'Start your wishpeti journey today.' : 'Log in to manage your Peti.')}
          </p>
        </div>

        <button onClick={handleGoogleLogin} style={googleBtnStyle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
          Continue with Google
        </button>

        <div style={dividerContainer}>
          <div style={lineStyle}></div>
          <span style={{ padding: '0 12px', color: '#9ca3af', fontSize: '0.85rem' }}>OR</span>
          <div style={lineStyle}></div>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af', fontWeight: 'bold' }}>@</span>
                <input
                  disabled={!!claimUsername}
                  placeholder="yourname"
                  style={{ ...inputStyle, paddingLeft: '32px', backgroundColor: claimUsername ? '#f3f4f6' : 'white' }} 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  required
                />
              </div>
              {claimUsername && <p style={{fontSize: '11px', color: '#b45309', marginTop: '4px'}}>✨ This handle is reserved for you.</p>}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" placeholder="name@example.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="••••••••" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={primaryBtnStyle}>
            {loading ? 'Processing...' : (isSignup ? 'Claim Profile' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}