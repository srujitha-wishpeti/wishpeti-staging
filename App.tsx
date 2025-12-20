
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import CreatorDashboard from './components/CreatorDashboard';
import PublicWishlist from './components/PublicWishlist';
import ExploreCreators from './components/ExploreCreators';
import AuthPage from './components/AuthPage';
import { AppRoute } from './types';
import { WishPetiProvider, useWishPeti } from './context/WishPetiContext';
import { isSupabaseConfigured } from './services/supabaseClient';

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LANDING);
  const { user, isLoading } = useWishPeti();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleStart = () => {
    if (user) {
      setCurrentRoute(AppRoute.DASHBOARD);
    } else {
      setCurrentRoute(AppRoute.AUTH);
    }
  };

  const renderRoute = () => {
    switch (currentRoute) {
      case AppRoute.LANDING:
        return <LandingPage onStart={handleStart} />;
      case AppRoute.DASHBOARD:
        return user ? <CreatorDashboard /> : <AuthPage onSuccess={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.AUTH:
        return <AuthPage onSuccess={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.EXPLORE:
        return <ExploreCreators onSelect={() => setCurrentRoute(AppRoute.PUBLIC_WISH_PETI)} />;
      case AppRoute.PUBLIC_WISH_PETI:
        return <PublicWishlist />;
      default:
        return <LandingPage onStart={handleStart} />;
    }
  };

  return (
    <Layout onNavigate={(route) => setCurrentRoute(route as AppRoute)}>
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                 Running in Demo Mode (Supabase Keys Missing)
              </p>
              <a href="https://supabase.com" target="_blank" className="text-[10px] font-black text-amber-800 underline uppercase tracking-tighter">Configure Backend</a>
           </div>
        </div>
      )}

      {/* Dev Navigation Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-6 border border-white/10 text-[10px] uppercase font-bold tracking-widest">
        <button onClick={() => setCurrentRoute(AppRoute.LANDING)} className={`transition-colors ${currentRoute === AppRoute.LANDING ? 'text-indigo-400' : 'hover:text-slate-300'}`}>Home</button>
        <button onClick={() => setCurrentRoute(AppRoute.EXPLORE)} className={`transition-colors ${currentRoute === AppRoute.EXPLORE ? 'text-indigo-400' : 'hover:text-slate-300'}`}>Explore</button>
        <button onClick={() => user ? setCurrentRoute(AppRoute.DASHBOARD) : setCurrentRoute(AppRoute.AUTH)} className={`transition-colors ${currentRoute === AppRoute.DASHBOARD || currentRoute === AppRoute.AUTH ? 'text-indigo-400' : 'hover:text-slate-300'}`}>Creator</button>
        <button onClick={() => setCurrentRoute(AppRoute.PUBLIC_WISH_PETI)} className={`transition-colors ${currentRoute === AppRoute.PUBLIC_WISH_PETI ? 'text-indigo-400' : 'hover:text-slate-300'}`}>Fan</button>
      </div>
      
      {renderRoute()}
    </Layout>
  );
};

const App: React.FC = () => (
  <WishPetiProvider>
    <AppContent />
  </WishPetiProvider>
);

export default App;
