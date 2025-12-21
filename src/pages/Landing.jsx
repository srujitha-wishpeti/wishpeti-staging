import { supabase } from '../services/supabaseClient'

export default function Landing() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>The Safest Way for Digital Creators to Receive Gifts. 🎁</h1>
      <p>Build your WishPeti in minutes. Receive physical gifts or secure payments while keeping your personal address and identity 100% private. Trusted by top influencers to bridge the gap between creators and fans—safely.</p>
    </div>
  )
}
