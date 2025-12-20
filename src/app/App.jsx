import AppRoutes from './routes'
import { AuthProvider } from '../auth/AuthProvider'
import Navbar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import { ToastProvider } from '../context/ToastContext';
import posthog from 'posthog-js'
import { CurrencyProvider } from '../context/CurrencyContext'; // Import the provider

posthog.init('phc_vIs6zgMRd0aFOfF5xi7trkkO7x0Wqlxnya1e5sWETKh', {
    api_host: 'https://us.i.posthog.com', // or https://eu.i.posthog.com
    person_profiles: 'identified_only', // Recommended for privacy
    capture_pageview: true, // Tracks every URL change automatically
})

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <CurrencyProvider>
          <AppRoutes />
        </CurrencyProvider>
        <Footer />
      </ToastProvider>
    </AuthProvider>
  )
}