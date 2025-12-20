
import React from 'react';
import { MOCK_CREATOR } from '../constants';

interface ExploreCreatorsProps {
  onSelect: (creator: any) => void;
}

const ExploreCreators: React.FC<ExploreCreatorsProps> = ({ onSelect }) => {
  const creators = [
    MOCK_CREATOR,
    {
      id: 'c2',
      name: 'Varun Tech',
      username: 'varun_unboxed',
      bio: 'Deep dives into the latest gadgets. 💻',
      avatar: 'https://picsum.photos/seed/varun/200/200',
      banner: 'https://picsum.photos/seed/varunbanner/1200/400'
    },
    {
      id: 'c3',
      name: 'Riya Cooks',
      username: 'riya_kitchen',
      bio: 'Modern Indian recipes made simple. 🥘',
      avatar: 'https://picsum.photos/seed/riya/200/200',
      banner: 'https://picsum.photos/seed/riyabanner/1200/400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Discover Creators</h1>
        <p className="text-slate-500 text-lg">Send a gift to your favorite Indian creators safely and securely.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {creators.map(c => (
          <div 
            key={c.id}
            onClick={() => onSelect(c)}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
          >
            <div className="h-32 bg-slate-100 overflow-hidden">
              <img src={c.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="banner" />
            </div>
            <div className="p-8 pt-0 -mt-10 relative">
              <img src={c.avatar} className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg mb-4" alt="avatar" />
              <h3 className="text-xl font-bold text-slate-900">@{c.username}</h3>
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{c.bio}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Verified</span>
                <button className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">View WishPeti →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreCreators;
