
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            India's #1 Secure Gifting for Creators
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Bridge the Gap with <br />
            <span className="text-indigo-600 bg-clip-text">Safe Gifting</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
            Curate your <strong>WishPeti</strong>, accept secure payments via Razorpay, and receive physical gifts at your doorstep without ever revealing your address to anyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200"
            >
              Get Your WishPeti Free
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              Watch How It Works
            </button>
          </div>

          <div className="mt-20 flex justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">Razorpay Protected</span>
            <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">Shadow Addresses</span>
            <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">AI Curated</span>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-400/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-400/10 blur-[120px] rounded-full"></div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Total Privacy</h3>
              <p className="text-slate-600">Your address is hidden. We handle shipping through our 'Shadow Address' system. Your safety is our priority.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Razorpay Integrated</h3>
              <p className="text-slate-600">Seamless payments via UPI, Cards, or Netbanking. Directly settle to your bank account with minimal fees.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Curation</h3>
              <p className="text-slate-600">Use Gemini to suggest the best gifts for your setup. Optimize descriptions to build deeper fan connections.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
