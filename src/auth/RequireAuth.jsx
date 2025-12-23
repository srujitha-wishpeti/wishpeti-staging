import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  if (!session) {
    return <Navigate to="/auth?mode=login" replace />
  }

  return children
}
