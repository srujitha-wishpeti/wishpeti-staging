import { supabase } from '../services/supabaseClient'

export default function Landing() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>🎁 Wish-based Gifting Platform</h1>
      <p>Create wishlists. Let your audience gift meaningfully.</p>
    </div>
  )
}
