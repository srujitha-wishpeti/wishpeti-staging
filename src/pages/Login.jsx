import { supabase } from '../services/supabaseClient'

export default function Login() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div>
      <h2>Login</h2>
      <button onClick={login}>Continue with Google</button>
    </div>
  )
}
