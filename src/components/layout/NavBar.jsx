import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../auth/AuthProvider'

export default function Navbar() {
  const { session } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  // Get user display info (Google users often have 'full_name' in metadata)
  const userName = session?.user?.user_metadata?.full_name || "Account";

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Sign out error caught:", error.message);
    } finally {
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/'; 
    }
  };

  return (
    <header style={styles.header}>
      <Link to={session ? "/wishlist" : "/"} style={styles.logo}>
        🎁 WishGifts
      </Link>

      <nav style={styles.nav}>
        {!session ? (
          <>
            <Link to="/auth?mode=login" style={styles.link}>Log in</Link>
            <Link to="/auth?mode=signup" style={styles.primaryBtn}>Sign up</Link>
            <Link to="/cart" style={styles.link}>🛒 Cart</Link>
          </>
        ) : (
          <>
            <Link to="/cart" style={styles.link}>🛒 Cart</Link>
            
            {/* --- DROPDOWN MENU START --- */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                style={styles.menuTrigger}
              >
                👤 {userName} ▾
              </button>

              {showMenu && (
                <div style={styles.dropdown}>
                  <div style={styles.userInfo}>
                    <p style={styles.userEmail}>{session.user.email}</p>
                    <p style={styles.helperText}>Shipping address set ✅</p>
                  </div>
                  
                  <hr style={styles.divider} />
                  
                  <Link to="/onboarding" style={styles.dropdownLink} onClick={() => setShowMenu(false)}>
                    Edit Address
                  </Link>
                  
                  <button onClick={logout} style={styles.logoutBtn}>
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* --- DROPDOWN MENU END --- */}
          </>
        )}
      </nav>
      
      {/* Overlay to close menu when clicking outside */}
      {showMenu && <div style={styles.overlay} onClick={() => setShowMenu(false)} />}
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
    position: 'fixed', // Keep it at the top
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  logo: { textDecoration: 'none', fontWeight: 'bold', fontSize: 18, color: 'black' },
  nav: { display: 'flex', gap: 12, alignItems: 'center' },
  link: { textDecoration: 'none', padding: '6px 10px', color: 'black' },
  primaryBtn: {
    textDecoration: 'none',
    padding: '6px 12px',
    background: 'black',
    color: 'white',
    borderRadius: 4,
  },
  menuTrigger: {
    padding: '8px 12px',
    background: '#f3f4f6',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '45px',
    width: '220px',
    background: 'white',
    border: '1px solid #eee',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '12px',
    zIndex: 1001,
  },
  userInfo: { paddingBottom: '8px' },
  userEmail: { margin: 0, fontSize: '13px', color: '#666', fontWeight: '500' },
  helperText: { margin: '4px 0 0 0', fontSize: '11px', color: '#10b981' },
  divider: { border: '0', borderTop: '1px solid #eee', margin: '8px 0' },
  dropdownLink: {
    display: 'block',
    textDecoration: 'none',
    color: '#374151',
    padding: '8px 0',
    fontSize: '14px',
  },
  logoutBtn: {
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    padding: '8px 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  }
}