import { supabase } from '../services/supabaseClient'

export default function Landing() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Safe & Secure Gifting for India's Top Creators. 🎁</h1>
      <p>Bridge the gap between you and your fans. Curate your WishPeti, accept secure payments via Razorpay, and receive gifts at your doorstep with total privacy.</p>
    </div>
  )
}
