import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../auth/AuthProvider'

export default function Navbar() {
  const { session } = useAuth()

  const logout = async () => {
    await supabase.auth.signOut()
  }

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
          </>
        ) : (
          <>
            <button onClick={logout} style={styles.button}>
              Logout
            </button>
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
