import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../auth/AuthProvider'
import { ShoppingCart, User, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { session } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('wishlist_cart') || '[]')
    setCartCount(cart.length)
  }

  useEffect(() => {
    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  const logout = async () => {
    setShowMenu(false); // Close menu first
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/'; 
  };

  return (
    <header style={styles.header}>
      <Link to={session ? "/wishlist" : "/"} style={styles.logo}>
        🎁 WishGifts
      </Link>

      <nav style={styles.nav}>
        {/* Cart Link - Visible to everyone */}
        <Link to="/cart" style={styles.cartLink}>
          <div style={styles.cartIconWrapper}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
          </div>
        </Link>

        {!session ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/auth?mode=login" style={styles.link}>Log in</Link>
            <Link to="/auth?mode=signup" style={styles.primaryBtn}>Sign up</Link>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={styles.menuTrigger}>
              <User size={18} />
              <ChevronDown size={14} />
            </button>

            {showMenu && (
              <>
                {/* Invisible backdrop to close menu */}
                <div style={styles.menuOverlay} onClick={() => setShowMenu(false)} />
                
                <div style={styles.dropdown}>
                  <div style={styles.userInfo}>
                    <p style={styles.userEmail}>{session.user.email}</p>
                  </div>
                  <hr style={styles.divider} />
                  <Link to="/onboarding" style={styles.dropdownLink} onClick={() => setShowMenu(false)}>
                    <Settings size={14} /> Edit Profile
                  </Link>
                  <button onClick={logout} style={styles.logoutBtn}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
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
    padding: '0 24px',
    height: '70px',
    borderBottom: '1px solid #eee',
    position: 'fixed',
    top: 0, left: 0, right: 0,
    backgroundColor: 'white',
    zIndex: 2000, // Higher than everything else
  },
  logo: { textDecoration: 'none', fontWeight: 'bold', fontSize: 20, color: 'black' },
  nav: { display: 'flex', gap: 15, alignItems: 'center' },
  cartLink: {
    padding: '8px',
    borderRadius: '50%',
    background: '#f8fafc',
    display: 'flex',
    position: 'relative',
    color: '#1e293b'
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ef4444',
    color: 'white',
    fontSize: '10px',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white',
    fontWeight: 'bold'
  },
  menuTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '50px',
    width: '200px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '8px',
    zIndex: 2100, // Higher than header
    border: '1px solid #f1f5f9'
  },
  menuOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2050,
    background: 'transparent'
  },
  dropdownLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    textDecoration: 'none',
    color: '#334155',
    fontSize: '14px',
    borderRadius: '8px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px',
    border: 'none',
    background: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  divider: { margin: '4px 0', border: 'none', borderTop: '1px solid #f1f5f9' },
  userEmail: { fontSize: '12px', color: '#64748b', padding: '4px 10px', margin: 0 },
  primaryBtn: { background: 'black', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' },
  link: { textDecoration: 'none', color: '#475569', fontSize: '14px' }
}