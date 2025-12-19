import AppRoutes from './routes'
import { AuthProvider } from '../auth/AuthProvider'
import Navbar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
      <Footer />
    </AuthProvider>
  )
}
