import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Dashboard from '../pages/Dashboard'
import RequireAuth from '../auth/RequireAuth'
import Auth from '../pages/Auth'
import WishlistPage from '../pages/WishlistPage'
import CartPage from '../pages/CartPage'
import { useAuth } from '../auth/AuthProvider'
import CheckProfileCompletion from '../auth/CheckProfileCompletion'
import Onboarding from '../pages/OnBoarding'
import PolicyPage from '../pages/PolicyPage' 
import ManageGifts from '../components/ManageGifts'
import TrackOrder from '../pages/TrackOrder'
import SuccessPage from '../pages/SuccessPage'
import AdminFulfillment from '../pages/AdminFulfillment'
import ScrollToTop from "../components/ScrollToTop";
import ItemDetailView from '../pages/ItemDetailView';
import CookieBanner from '../components/CookieBanner';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  const { session, loading } = useAuth();
  const ADMIN_EMAILS = ['msrujitha@gmail.com', 'madhubandru@gmail.com', 'shashi.karnati@gmail.com'];
  // Wait for Supabase to check the session before rendering
  if (loading) return null; 

  return (
    <>
    <CookieBanner />
    <ScrollToTop />
    <Routes>
      {/* AUTH LOGIC */}
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      
      {/* CREATOR TOOLS */}
      <Route 
        path="/manage-gifts" 
        element={
          <RequireAuth>
            <ManageGifts />
          </RequireAuth>
        } 
      />
      <Route path="/404" element={<NotFoundPage />} />
      
      {/* PUBLIC GIFTING FLOW */}
      <Route path="/:username/item/:itemId" element={<ItemDetailView />} />
      <Route path="/:username" element={<WishlistPage />} />
      
      <Route path="/track/:orderId" element={<TrackOrder />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/success/:orderId" element={<SuccessPage />} />
      <Route 
        path="/admin-fulfill" 
        element={
          session?.user?.email && ADMIN_EMAILS.includes(session.user.email) ? 
          <AdminFulfillment /> : 
          <Navigate to="/" />
        } 
      />
      {/* ONBOARDING & DASHBOARD */}
      <Route path="/onboarding" element={
        <RequireAuth>
          <Onboarding />
        </RequireAuth>
      } />

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

      <Route path="/wishlist" element={<Navigate to={session ? "/dashboard" : "/"} />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* LEGAL & POLICY ROUTES (Razorpay Compliant) */}
      <Route 
        path="/terms" 
        element={<PolicyPage title="Terms & Conditions" content={`<div class="policy-text">
          <p>Last updated on <strong>December 27, 2025</strong></p>
          <p>Welcome to <strong>WishPeti</strong>. By using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>

          <h3>1. Service Overview</h3>
          <p><strong>WishPeti</strong> provides a platform that allows users ("Fans" or "Supporters") to purchase gifts or contribute to crowdfunding goals for third-party individuals ("Creators"). We act as a facilitator between the Fan and the Creator or third-party merchants who fulfill the items.</p>

          <h3>2. Payments and Pricing</h3>
          <ul>
              <li>All payments are processed securely through <strong>Razorpay</strong>.</li>
              <li><strong>Total Display Price:</strong> The price shown at checkout is the final price inclusive of the item cost, shipping, applicable taxes, and a Peti convenience fee.</li>
              <li><strong>Non-Refundable Fees:</strong> By completing a purchase, the Fan acknowledges that convenience fees and processing charges are non-refundable in the event of a gift rejection.</li>
          </ul>

          <h3>3. Order Rejections and Refunds</h3>
          <ul>
              <li>Creators reserve the right to accept or reject any gift.</li>
              <li>If a gift is rejected, a refund of the item cost (excluding non-refundable fees) will be initiated to the original payment method.</li>
              <li>Refunds typically take <strong>5-7 business days</strong> to reflect in the Supporter's account.</li>
          </ul>

          <h3>4. Crowdfunding and Contributions</h3>
          <ul>
              <li>Contributions to crowdfunded goals are tracked in real-time on the Creator's profile.</li>
              <li>Once a goal is reached, the Creator is responsible for the allocation of those funds toward the specified item.</li>
          </ul>

          <h3>5. Order Fulfillment</h3>
          <ul>
              <li>Items are shipped directly from third-party merchants to the recipient.</li>
              <li>Delivery timelines are typically <strong>7-10 working days</strong>, subject to merchant availability.</li>
          </ul>

          <h3>6. Contact Information</h3>
          <p>Email: <strong>support@wishpeti.com</strong><br>
          Address: <strong>Vidya Nagar 1st cross, Bellary, Karnataka - 583104</strong></p>
      </div>`} />} 
      />

      <Route 
        path="/privacy" 
        element={<PolicyPage title="Privacy Policy" content={`<div class="policy-text">
    <p>Last updated on <strong>December 20, 2025</strong></p>
    
    <h3>1. Information We Collect</h3>
    <p>We collect name, email address, and contact details provided during checkout to process and fulfill gift orders.</p>

    <h3>2. Data Sharing</h3>
    <p>We do not sell your data. We only share necessary details with third-party merchants for delivery and with <strong>Razorpay</strong> for secure payment processing.</p>

    <h3>3. Creator Privacy</h3>
    <p>A creator's shipping address is <strong>never</strong> shared with fans. WishPeti acts as a secure intermediary for all physical deliveries.</p>
</div>`} />} 
      />

      <Route 
        path="/refund" 
        element={<PolicyPage title="Refund & Cancellation Policy" content={`<div class="policy-text">
    <p>Last updated on <strong>December 20, 2025</strong></p>
    
    <h3>1. Cancellation Policy</h3>
    <p>Cancellations are accepted within <strong>24 hours</strong> of placing the order, provided the order has not yet been processed by our merchants.</p>

    <h3>2. Refund Policy</h3>
    <p>A refund may be initiated if an item is out of stock or undeliverable. Approved refunds will be processed back to the original payment method.</p>

    <h3>3. Refund Processing</h3>
    <p>The refund will reflect in your account within <strong>5 to 7 working days</strong>, depending on your bank's processing time.</p>
</div>`} />} 
      />

      <Route 
        path="/shipping" 
        element={<PolicyPage title="Shipping Policy" content={`<div class="policy-text">
    <p>Last updated on <strong>December 20, 2025</strong></p>
    
    <h3>1. Shipping Timelines</h3>
    <p>Orders are typically processed within 2-3 working days. Estimated delivery time is <strong>7-10 working days</strong> across India.</p>

    <h3>2. Shipping Charges</h3>
    <p>We charge a consolidated <strong>8% Service & Shipping Fee</strong> at checkout to cover platform handling and delivery logistics.</p>
</div>`} />} 
      />

      <Route 
        path="/contact" 
        element={<PolicyPage title="Contact Us" content={`<div class="contact-container">
    <p>We're here to support your gifting journey.</p>
    <div class="contact-details" style="margin-top: 20px;">
      <p><strong>Email:</strong> support@wishpeti.com</p>
      <p><strong>Phone:</strong> +91 9972769491</p>
      <p><strong>Address:</strong> WishPeti, Vidya Nagar 1st cross, Bellary, Karnataka - 583104</p>
      <p><strong>Operating Hours:</strong> Monday to Friday, 10:00 AM – 6:00 PM IST</p>
    </div>
</div>`} />} 
      />
    </Routes>
    </>
  );
}