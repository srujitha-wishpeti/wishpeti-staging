import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../auth/AuthProvider'

export default function Navbar() {
  const { session } = useAuth()

  const logout = async () => {
    try {
      // Attempt standard sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Sign out error caught:", error.message);
    } finally {
      // 🔑 FORCE local cleanup even if the server call (403) fails
      // This clears the 'session' state in your AuthProvider
      localStorage.removeItem('supabase.auth.token'); // Adjust key name if custom
      
      // Redirect to landing
      window.location.href = '/'; 
    }
  };

  return (
    <header style={styles.header}>
      {!session ? (
        <Link to="/" style={styles.logo}>
        🎁 WishGifts
      </Link>
      ) : (
        <Link to="/wishlist" style={styles.logo}>
        🎁 WishGifts
      </Link>
      )}
      <nav style={styles.nav}>
        {!session ? (
          <>
            <Link to="/auth?mode=login" style={styles.link}>
              Log in
            </Link>
            <Link to="/auth?mode=signup" style={styles.primaryBtn}>
              Sign up
            </Link>
            <Link to="/cart">🛒 Cart</Link>
          </>
        ) : (
          <>
            <button onClick={logout} style={styles.button}>
              Logout
            </button>
            <Link to="/cart">🛒 Cart</Link>
          </>
        )}
      </nav>
    </header>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #eee',
  },
  logo: {
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: 18,
  },
  nav: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    padding: '6px 10px',
    color: 'black',
  },
  button: {
    padding: '6px 10px',
    cursor: 'pointer',
  },
  primaryBtn: {
    textDecoration: 'none',
    padding: '6px 12px',
    background: 'black',
    color: 'white',
    borderRadius: 4,
  },
}
