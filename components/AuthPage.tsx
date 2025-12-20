
import React, { useState } from 'react';
import { api } from '../services/storage';
import { useWishPeti } from '../context/WishPetiContext';

interface AuthPageProps {
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { refreshData } = useWishPeti();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.login(email);
      if (api.isMock) {
        await refreshData();
        onSuccess();
      } else {
        setSent(true);
      }
    } catch (e: any) {
      alert("Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return <div className="max-w-md mx-auto py-20 text-center">Check your email for the magic link!</div>;

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">Welcome to WishPeti</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-5 py-3 rounded-xl border" />
          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">{loading ? 'Loading...' : 'Send Magic Link'}</button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
