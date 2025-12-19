import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Navbar({ session }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Check if we are currently viewing a public wishlist
  const isPublicWishlist = location.pathname.startsWith('/wishlist/');

  return (
    <header style={styles.header}>
      {/* If logged in, logo goes to dashboard.
          If public viewer, logo stays on the current page or goes to landing.
      */}
      <Link to={session ? "/dashboard" : "/"} style={styles.logo}>
        🎁 WishGifts
      </Link>

      <nav style={styles.nav}>
        {!session ? (
          <>
            {/* If a fan is viewing, they see Login/Signup options without being forced to use them */}
            <Link to="/auth?mode=login" style={styles.link}>
              Log in
            </Link>
            <Link to="/auth?mode=signup" style={styles.primaryBtn}>
              Sign up
            </Link>
            
            {/* Optional: Add a 'My Cart' link for guests if they have items */}
            <Link to="/cart" style={{...styles.link, marginLeft: '10px'}}>
               🛒 Cart
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/cart" style={styles.link}>My Cart</Link>
            <button onClick={logout} style={styles.button}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

// Add these to your existing styles object
const styles = {
  // ... your existing styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'white',
    borderBottom: '1px solid #eee'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#111'
  },
  link: {
    textDecoration: 'none',
    color: '#444',
    fontSize: '0.9rem'
  },
  primaryBtn: {
    textDecoration: 'none',
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem'
  },
  button: {
    background: 'none',
    border: '1px solid #ddd',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};