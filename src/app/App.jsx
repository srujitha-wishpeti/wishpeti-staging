import AppRoutes from './routes'
import { AuthProvider } from '../auth/AuthProvider'
import Navbar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import ToastProvider from '../context/ToastContext'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <AppRoutes />
        <Footer />
      </ToastProvider>
    </AuthProvider>
  )
}