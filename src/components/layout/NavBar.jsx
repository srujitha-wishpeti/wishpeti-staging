import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../auth/AuthProvider'
import { ShoppingCart, User, LogOut, Settings, ChevronDown } from 'lucide-react'

const navStyles = {
  manageLink: {
    color: '#6366f1',
    fontWeight: '600',
    border: '1px solid #6366f1',
    padding: '6px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-block',
    cursor: 'pointer',
    backgroundColor: 'transparent'
  }
};

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
    setShowMenu(false)
    await supabase.auth.signOut()
    localStorage.removeItem('supabase.auth.token')
    window.location.href = '/'
  };

  return (
    <header style={styles.header}>
      <Link to={session ? "/wishlist" : "/"} style={styles.logo}>
        🎁 WishPeti
      </Link>
      
      <nav style={styles.nav}>
        {/* Cart Link */}
        <Link to="/cart" style={styles.cartLink}>
          <div style={styles.cartIconWrapper}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
          </div>
        </Link>

        {!session ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/auth?mode=login" style={styles.link}>Log in</Link>
            <Link to="/auth?mode=signup" style={styles.primaryBtn}>Sign up</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
            <Link 
              to="/manage-gifts" 
              style={navStyles.manageLink}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#6366f1';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6366f1';
              }}
            >
              Manage Gifts
            </Link>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu(!showMenu)} style={styles.menuTrigger}>
                <User size={18} />
                <ChevronDown size={14} />
              </button>

              {showMenu && (
                <>
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
    zIndex: 2000,
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
  cartIconWrapper: { position: 'relative', display: 'flex' },
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
    zIndex: 2100,
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
  userInfo: { padding: '4px 0' },
  userEmail: { fontSize: '12px', color: '#64748b', padding: '4px 10px', margin: 0 },
  primaryBtn: { background: 'black', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' },
  link: { textDecoration: 'none', color: '#475569', fontSize: '14px' }
}