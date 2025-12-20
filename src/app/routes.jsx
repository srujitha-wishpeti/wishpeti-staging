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
import Onboarding from '../pages/OnBoarding';
import PolicyPage from '../pages/PolicyPage'; // Adjust path

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
      <Route 
        path="/terms" 
        element={<PolicyPage title="Terms & Conditions" content={`<div class="policy-text">
    <p>Last updated on <strong>December 20, 2025</strong></p>
    <p>Welcome to <strong>WishPeti</strong>. By using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>

    <h3>1. Service Overview</h3>
    <p><strong>WishPeti</strong> provides a platform that allows users ("Fans") to purchase gifts for third-party individuals ("Creators"). We act as a facilitator between the Fan and third-party merchants who fulfill and ship the items.</p>

    <h3>2. Payments and Fees</h3>
    <ul>
        <li>All payments are processed securely through <strong>Razorpay</strong>.</li>
        <li>Users agree to pay the total amount shown at checkout, which includes the item subtotal and a <strong>8% Platform Service Fee</strong>.</li>
        <li>By completing a transaction, you authorize us to charge your selected payment method for the total amount.</li>
    </ul>

    <h3>3. Order Fulfillment</h3>
    <ul>
        <li>Items are shipped directly from third-party merchants to the recipient.</li>
        <li>We are not responsible for delays caused by the merchant or shipping carriers.</li>
        <li>Delivery timelines are typically <strong>7-10 working days</strong>, depending on the merchant's location and stock availability.</li>
    </ul>

    <h3>4. User Responsibilities</h3>
    <p>You agree to provide accurate and current information during the checkout process, including your name and email address. You are responsible for ensuring that the gift selected is appropriate for the recipient.</p>

    <h3>5. Limitation of Liability</h3>
    <p><strong>WishPeti</strong> shall not be liable for any indirect, incidental, or consequential damages arising out of the use of our service or the purchase of any gifts. Our total liability is limited to the amount paid for the specific transaction in question.</p>

    <h3>6. Governing Law</h3>
    <p>These terms are governed by the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in <strong>[Your City, State]</strong>.</p>

    <h3>7. Contact Information</h3>
    <p>If you have any questions about these Terms, please contact us at:</p>
    <p>Email: <strong>msrujitha@gmail.com</strong><br>
    Phone: <strong>+919972769491</strong><br>
    Address: <strong>Vidya Nagar 1st cross, Bellary, Karntaka - 583104</strong></p>
</div>`} />} 
      />
      <Route 
        path="/privacy" 
        element={<PolicyPage title="Privacy Policy" content={`<div class="policy-text">
    <p>Last updated on <strong>December 20, 2025</strong></p>
    
    <h3>1. Information We Collect</h3>
    <p>At <strong>WishPeti</strong>, we collect information to provide a better gifting experience. This includes:</p>
    <ul>
        <li><strong>Personal Information:</strong> Name, email address, and contact details provided during checkout.</li>
        <li><strong>Transaction Data:</strong> Details of the gifts purchased, though we do not store your full card details (these are handled securely by Razorpay).</li>
        <li><strong>Recipient Data:</strong> The creator's name or username to whom the gift is being sent.</li>
    </ul>

    <h3>2. How We Use Your Information</h3>
    <p>We use the collected data to:</p>
    <ul>
        <li>Process and fulfill your gift orders.</li>
        <li>Communicate with third-party merchants to arrange delivery to the creator.</li>
        <li>Send order confirmations and updates via email.</li>
        <li>Comply with legal and regulatory requirements from our payment partners.</li>
    </ul>

    <h3>3. Data Sharing and Disclosure</h3>
    <p>We do not sell your data. We only share information with:</p>
    <ul>
        <li><strong>Third-Party Merchants:</strong> Necessary details (like the item and recipient address) to fulfill the gift.</li>
        <li><strong>Payment Processors:</strong> We use <strong>Razorpay</strong> for secure transactions. Your data is handled according to <a href="https://razorpay.com/privacy/" target="_blank">Razorpay’s Privacy Policy</a>.</li>
    </ul>

    <h3>4. Data Security</h3>
    <p>We implement industry-standard security measures to protect your personal information. However, please note that no method of transmission over the internet is 100% secure.</p>

    <h3>5. Your Rights</h3>
    <p>You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact us at <strong>[Your Support Email]</strong>.</p>

    <h3>6. Contact Us</h3>
    <p>For any questions regarding this Privacy Policy, you can reach us at:</p>
    <p>Email: <strong>msrujitha@gmail.com</strong><br>
    Phone: <strong>+919972769491</strong><br>
    Address: <strong>Vidya Nagar 1st cross, Bellary, Karntaka - 583104</strong></p>
</div>`} />} 
      />
      <Route 
        path="/refund" 
        element={<PolicyPage title="Refund & Cancellation Policy" content={`<div class="policy-text">
    <p>Last updated on [Date]</p>
    
    <h3>1. Cancellation Policy</h3>
    <p>Gifts on <strong>WishPeti</strong> are often processed immediately to ensure timely delivery to creators. Therefore:</p>
    <ul>
        <li>Cancellations are only accepted within <strong>24 hours</strong> of placing the order, provided the order has not yet been processed or shipped by our third-party merchants.</li>
        <li>To request a cancellation, please email us at <strong>[Your Support Email]</strong> with your Order ID.</li>
    </ul>

    <h3>2. Refund Policy</h3>
    <p>Due to the nature of our service (third-party gifting), we generally follow a <strong>No Refund</strong> policy once a gift has been successfully delivered to the recipient. However, a refund may be initiated in the following cases:</p>
    <ul>
        <li>The requested item is out of stock with the merchant.</li>
        <li>The merchant is unable to deliver to the creator's specific location.</li>
        <li>The payment was successful, but the order failed to generate in our system.</li>
    </ul>

    <h3>3. Refund Processing</h3>
    <p>Approved refunds will be processed back to the original payment method (Credit Card, Debit Card, UPI, or Net Banking) used during the transaction.</p>
    <ul>
        <li>The refund will typically reflect in your account within <strong>5 to 7 working days</strong>, depending on your bank's processing time.</li>
    </ul>

    <h3>4. Damaged or Incorrect Items</h3>
    <p>Since items are shipped directly from merchants to creators, if a creator receives a damaged or incorrect item, please contact our support team within 48 hours of delivery with photographic evidence. We will coordinate with the merchant for a replacement or resolution.</p>

    <h3>5. Contact Us</h3>
    <p>For any questions regarding our Refund and Cancellation Policy, please contact us at:</p>
    <p>Email: <strong>msrujitha@gmail.com</strong><br>
    Phone: <strong>+919972769491</strong><br>
    Address: <strong>Vidya Nagar 1st cross, Bellary, Karntaka - 583104</strong></p>
</div>`} />} 
      />
      <Route 
        path="/shipping" 
        element={<PolicyPage title="Shipping Policy" content={`<div class="policy-text">
    <p>Last updated on <strong>December 20, 2025</strong></p>
    <p>At <strong>WishPeti</strong>, we facilitate the delivery of gifts from third-party merchants directly to your favorite creators.</p>

    <h3>1. Shipping Timelines</h3>
    <ul>
        <li>Orders are typically processed by our partner merchants within <strong>2-3 working days</strong>.</li>
        <li>Estimated delivery time for gifts is <strong>7-10 working days</strong> across India.</li>
        <li>Please note that delivery times may vary depending on the merchant's location and the creator's delivery address.</li>
    </ul>

    <h3>2. Shipping Charges</h3>
    <ul>
        <li>We charge a consolidated <strong>8% Service & Shipping Fee</strong> at checkout.</li>
        <li>This fee covers the cost of standard shipping from the merchant to the creator, as well as platform handling.</li>
    </ul>

    <h3>3. Tracking Your Gift</h3>
    <p>Once the merchant dispatches the item, a tracking link (if provided by the merchant) will be sent to your registered email address so you can follow the journey of your gift.</p>

    <h3>4. Delivery Locations</h3>
    <p>We currently facilitate shipping within <strong>India</strong>. If a merchant is unable to deliver to a specific location, we will contact you and initiate a full refund.</p>

    <h3>5. Contact Information</h3>
    <p>For any queries regarding the delivery of your gift, please contact us at:</p>
    <p>Email: <strong>msrujitha@gmail.com</strong><br>
    Phone: <strong>+919972769491</strong><br>
    Address: <strong>Vidya Nagar 1st cross, Bellary, Karntaka - 583104</strong></p>
</div>`} />} 
      />
      <Route 
        path="/contact" 
        element={<PolicyPage title="Contact Us" content={`<div className="contact-container">
  <h2>Contact WishPeti</h2>
  <p>We're here to support your gifting journey.</p>
  
  <div className="contact-details">
    <div className="contact-item">
      <h3>Customer Support</h3>
      <p><strong>Email:</strong> msrujitha@gmail.com</p>
      <p><strong>Phone:</strong> +91 9972769491</p>
    </div>

    <div className="contact-item">
      <h3>Registered Office Address</h3>
      <p>
        <strong>WishPeti</strong><br>
        Attn: Srujitha M (or your registered business name)<br>
        Email: <strong>msrujitha@gmail.com</strong><br>
        Phone: <strong>+919972769491</strong><br>
        Address: <strong>Vidya Nagar 1st cross, Bellary, Karnataka - 583104</strong>
      </p>
      </address>
    </div>

    <div className="contact-item">
      <h3>Operating Hours</h3>
      <p>Monday to Friday: 10:00 AM – 6:00 PM IST</p>
    </div>
  </div>
</div>`} />} 
      />

    </Routes>
  );
}
