import { supabase } from '../services/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export default function Dashboard() {
  const { session } = useAuth()

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>Creator Dashboard</h1>

    </div>
  )
}
