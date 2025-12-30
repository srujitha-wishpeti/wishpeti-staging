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

  // --- Styles ---
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '20px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    textAlign: 'center',
    border: '1px solid #fee2e2',
  };

  const googleBtnStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const dividerContainer = {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  };

  const lineStyle = {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  };

  const primaryBtnStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: loading ? '#9ca3af' : '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
    color: '#111827',
    WebkitTextFillColor: '#111827',
    pointerEvents: loading ? 'none' : 'auto',
  };

  const [isSignup, setIsSignup] = useState(mode === 'signup');
  
  useEffect(() => {
    setIsSignup(mode === 'signup');
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        // 1. Check for duplicate username
        const { data: existingUser } = await supabase
          .from('creator_profiles')
          .select('username')
          .ilike('username', username)
          .maybeSingle();

        if (existingUser) {
          setError("This username is already taken.");
          setLoading(false);
          return;
        }
        
        // 2. Attempt Signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // 3. Create Profile and Navigate to Onboarding
        if (data.user) {
          const { error: profileError } = await supabase
            .from('creator_profiles')
            .insert([{ 
                id: data.user.id, 
                email, 
                display_name: username, 
                username: username.toLowerCase() 
            }]);
          
          if (profileError) throw profileError;
          
          showToast("Account created! Let's set up your profile. 🎁");
          
          // Small delay to ensure AuthProvider picks up the session
          setTimeout(() => {
            navigate('/onboarding'); 
          }, 500);
        }
      } else {
        // Login logic
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        
        showToast("Welcome back!");
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.message.includes("unique constraint")) {
        setError("Account already registered. Try logging in.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            {isSignup ? 'Start your wishpeti journey today.' : 'Log in to manage your Peti.'}
          </p>
        </div>

        {/* 🚀 Google Login moved to the TOP */}
        <button onClick={handleGoogleLogin} style={googleBtnStyle}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            style={{ width: '18px', marginRight: '10px' }} 
          />
          Continue with Google
        </button>

        <div style={dividerContainer}>
          <div style={lineStyle}></div>
          <span style={{ padding: '0 12px', color: '#9ca3af', fontSize: '0.85rem' }}>OR</span>
          <div style={lineStyle}></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Pick a Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af', fontWeight: 'bold' }}>@</span>
                <input
                  placeholder="yourname"
                  style={{ ...inputStyle, paddingLeft: '32px' }} 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  required
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px' }}>
                Your link: <strong>https://wishpeti.com/{username || 'username'}</strong>
              </p>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={primaryBtnStyle}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isSignup ? 'Create Account' : 'Login'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#4b5563' }}>
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <span 
            style={{ color: '#4f46e5', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}