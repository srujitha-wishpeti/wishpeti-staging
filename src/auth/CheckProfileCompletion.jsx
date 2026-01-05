import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthProvider';

export default function CheckProfileCompletion({ children }) {
  const { session } = useAuth();
  const [hasUsername, setHasUsername] = useState(null);

  useEffect(() => {
    async function checkProfile() {
      const { data } = await supabase
        .from('creator_profiles')
        .select('username') //
        .eq('id', session.user.id)
        .single();

      setHasUsername(!!data?.username);
    }
    if (session) checkProfile();
  }, [session]);

  if (hasUsername === null) return <div>Loading profile...</div>;
  if (!hasUsername) return <Navigate to="/onboarding" />;

  return children;
}