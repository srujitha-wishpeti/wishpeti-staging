import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import RequireAuth from '../auth/RequireAuth'
import Auth from '../pages/Auth'
import WishlistPage from '../pages/WishlistPage';
import CartPage from '../pages/CartPage';
import PublicWishlist from '../pages/PublicWishlist';
import { useAuth } from '../auth/AuthProvider';
import CheckProfileCompletion from '../auth/CheckProfileCompletion';
import Onboarding from '../pages/Onboarding';

export default function AppRoutes() {
  const { session, loading } = useAuth();

  // Wait for Supabase to check the session before rendering anything
  if (loading) return null; 

  return (
    <Routes>
      {/* If logged in, send them to dashboard instead of Landing or Auth */}
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      
      {/* Public routes available to everyone */}
      <Route path="/wishlist/:username" element={<PublicWishlist />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/onboarding" element={
        <RequireAuth>
          <Onboarding />
        </RequireAuth>
        } 
      />
      {/* Private routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <CheckProfileCompletion>
              <WishlistPage />
            </CheckProfileCompletion>
          </RequireAuth>
        }
      />

      {/* Redirect /wishlist to dashboard if logged in, otherwise landing */}
      <Route path="/wishlist" element={<Navigate to={session ? "/dashboard" : "/"} />} />
    </Routes>
  );
}
