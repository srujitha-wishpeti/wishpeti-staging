import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useLocation } from 'react-router-dom'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const mode = params.get('mode') || 'signup'

  const [isSignup, setIsSignup] = useState(mode === 'signup')

  useEffect(() => {
    setIsSignup(mode === 'signup')
  }, [mode])

  const handleSubmit = async () => {
    setError(null)

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // create creator profile with username
      await supabase.from('creator_profiles').insert({
        id: data.user.id,
        email,
        display_name: username,
      })
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      }
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h2>{isSignup ? 'Sign up' : 'Log in'}</h2>

      {isSignup && (
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleSubmit}>
        {isSignup ? 'Create account' : 'Login'}
      </button>

      <p
        style={{ cursor: 'pointer', marginTop: 12 }}
        onClick={() => setIsSignup(!isSignup)}
      >
        {isSignup
          ? 'Already have an account? Log in'
          : 'New here? Sign up'}
      </p>

      <hr />

      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({ provider: 'google' })
        }
      >
        Continue with Google
      </button>
    </div>
  )
}
