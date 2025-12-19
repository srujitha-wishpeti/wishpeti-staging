import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import RequireAuth from '../auth/RequireAuth'
import Auth from '../pages/Auth'
import WishlistPage from '../pages/WishlistPage';
import CartPage from '../pages/CartPage';
import PublicWishlist from '../pages/PublicWishlist';

export default function AppRoutes() {
  return (
    <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/auth" element={<Auth />} />
  
  {/* Public View: This MUST be above any protected routes */}
  <Route path="/wishlist/:creatorId" element={<PublicWishlist />} />
  
  <Route path="/wishlist" element={<WishlistPage />} />
  <Route path="/cart" element={<CartPage />} />
  
  <Route
    path="/dashboard"
    element={
      <RequireAuth>
        <WishlistPage />
      </RequireAuth>
    }
  />
</Routes>
  )
}
