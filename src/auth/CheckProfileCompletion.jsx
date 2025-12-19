import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthProvider';

export default function CheckProfileCompletion({ children }) {
  const { session } = useAuth();
  const [hasAddress, setHasAddress] = useState(null);

  useEffect(() => {
    async function checkProfile() {
      const { data } = await supabase
        .from('creator_profiles')
        .select('address_line1')
        .eq('id', session.user.id)
        .single();
      
      setHasAddress(!!data?.address_line1);
    }
    if (session) checkProfile();
  }, [session]);

  if (hasAddress === null) return <div>Loading profile...</div>;
  if (!hasAddress) return <Navigate to="/onboarding" />;

  return children;
}