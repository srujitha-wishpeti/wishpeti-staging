import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import RequireAuth from '../auth/RequireAuth'
import Auth from '../pages/Auth'
import WishlistPage from '../pages/WishlistPage';
import CartPage from '../pages/CartPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
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
