
import React from 'react';
import { useWishPeti } from '../context/WishPetiContext';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (route: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  const { user, logout } = useWishPeti();

  const handleLogout = async () => {
    await logout();
    onNavigate?.('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div onClick={() => onNavigate?.('landing')} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:bg-indigo-700 transition-colors">W</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">WishPeti</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => onNavigate?.('explore')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Explore Creators</button>
              {user ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => onNavigate?.('dashboard')} className="text-sm font-bold text-indigo-600">Dashboard</button>
                  <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-200">Logout</button>
                </div>
              ) : (
                <button onClick={() => onNavigate?.('auth')} className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Log In</button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 WishPeti India. Secure gifting for the digital age.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
