import AppRoutes from './routes'
import { AuthProvider } from '../auth/AuthProvider'
import Navbar from '../components/layout/Navbar'

export default function App() {

  <div className="text-red-500 text-3xl">TAILWIND WORKS</div>
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  )
}
