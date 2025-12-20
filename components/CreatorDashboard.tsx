
import React, { useState, useEffect } from 'react';
import { WishlistItem, FulfillmentStatus, Creator } from '../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { getGiftSuggestions, scrapeProductDetails, optimizeWishlistDescription } from '../services/gemini';
import { useWishPeti } from '../context/WishPetiContext';

const chartData = [
  { name: 'Mon', gifts: 2 }, { name: 'Tue', gifts: 5 }, { name: 'Wed', gifts: 3 },
  { name: 'Thu', gifts: 8 }, { name: 'Fri', gifts: 12 }, { name: 'Sat', gifts: 15 },
  { name: 'Sun', gifts: 9 },
];

const CreatorDashboard: React.FC = () => {
  const { 
    creator, items, updateProfile, 
    addWishlistItem, removeWishlistItem, updateItemStatus 
  } = useWishPeti();

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<Creator | null>(null);
  const [isOptimizingBio, setIsOptimizingBio] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapedPreview, setScrapedPreview] = useState<Partial<WishlistItem> | null>(null);

  useEffect(() => {
    if (creator) setEditForm(creator);
  }, [creator]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAiCurate = async () => {
    if (!creator) return;
    setIsAiLoading(true);
    try {
      const suggestions = await getGiftSuggestions(creator.bio, "Production Gear");
      setAiSuggestions(suggestions);
      showToast("Generated new ideas for your Peti!");
    } catch (error) {
      showToast("Failed to get AI suggestions");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOptimizeBio = async () => {
    if (!editForm?.bio) return;
    setIsOptimizingBio(true);
    try {
      const newBio = await optimizeWishlistDescription(editForm.name, editForm.bio);
      setEditForm({ ...editForm, bio: newBio || editForm.bio });
      showToast("Bio optimized with Gemini! ✨");
    } catch (error) {
      showToast("Optimization failed.");
    } finally {
      setIsOptimizingBio(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      await updateProfile(editForm);
      showToast("Profile updated!");
      setShowEditProfile(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    try {
      const details = await scrapeProductDetails(scrapeUrl);
      setScrapedPreview(details);
      showToast("Details extracted!");
    } catch (error) {
      showToast("Could not parse this link.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleConfirmAdd = async () => {
    if (!scrapedPreview) return;
    await addWishlistItem({
      name: scrapedPreview.name || '',
      price: scrapedPreview.price || 0,
      description: scrapedPreview.description || '',
      imageUrl: scrapedPreview.imageUrl || `https://picsum.photos/seed/${scrapedPreview.name}/400/400`,
      category: scrapedPreview.category || 'Lifestyle',
      priority: 'medium',
      isFulfilled: false,
      fulfillmentStatus: 'active'
    });
    showToast("Added to WishPeti!");
    setScrapedPreview(null);
    setScrapeUrl('');
    setShowAddModal(false);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await removeWishlistItem(itemToDelete.id);
      showToast("Item removed");
      setItemToDelete(null);
    }
  };

  const getStatusBadgeClass = (status: FulfillmentStatus) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      default: return 'bg-indigo-50 text-indigo-600';
    }
  };

  if (!creator) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {toast && (
        <div className="fixed top-20 right-4 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm mb-8">
        <div className="h-48 w-full relative group">
          <img src={creator.banner} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute -bottom-12 left-8">
            <img src={creator.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg" />
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{creator.name}</h1>
            <p className="text-slate-500">@{creator.username} • {creator.bio}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowEditProfile(true)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center gap-2">Edit Profile</button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/wishlist/' + creator.username);
                showToast("Public link copied!");
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100"
            >Share Peti</button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Your WishPeti</h2>
              <button onClick={() => setShowAddModal(true)} className="px-5 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 font-bold text-sm">Add via Link</button>
            </div>
            
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="font-bold text-slate-600">No items yet</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50">
                    <img src={item.imageUrl} className="w-20 h-20 rounded-xl object-cover" alt={item.name} />
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-slate-900">{item.name}</h3>
                        <span className="text-indigo-600 font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button 
                          onClick={() => updateItemStatus(item.id, item.fulfillmentStatus)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getStatusBadgeClass(item.fulfillmentStatus)}`}
                        >
                          {item.fulfillmentStatus}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setItemToDelete(item)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">✨ Smart Suggestions</h2>
            <button onClick={handleAiCurate} disabled={isAiLoading} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">
              {isAiLoading ? 'Analyzing...' : 'Explore Gifting Trends'}
            </button>
            {aiSuggestions.length > 0 && (
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {aiSuggestions.map((s, idx) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-3xl border border-white/10">
                    <h4 className="font-bold text-white">{s.name}</h4>
                    <p className="text-xs text-slate-400 mb-4">₹{s.price.toLocaleString('en-IN')}</p>
                    <button onClick={() => addWishlistItem({...s, description: s.reason, imageUrl: `https://picsum.photos/seed/${s.name}/400/400`, priority: 'low', isFulfilled: false, fulfillmentStatus: 'active'})} className="w-full py-2 bg-white text-slate-900 rounded-xl text-xs font-bold">Add to Peti</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Insights</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}><XAxis dataKey="name" hide /><Tooltip /><Bar dataKey="gifts" fill="#4f46e5" radius={[6, 6, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem]">
            <h3 className="text-lg font-bold mb-2">Shadow Address</h3>
            <p className="text-indigo-100 text-sm mb-6">{creator.shadowAddress ? 'Your address is safely mapped.' : 'Add your address to receive gifts.'}</p>
            <button onClick={() => setShowEditProfile(true)} className="w-full py-3 bg-white/20 rounded-xl text-xs font-bold">Manage Routing</button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && editForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] p-8 overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-bold mb-8">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold mb-2">Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-2">Username</label><input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
              </div>
              <div><label className="block text-sm font-bold mb-2">Bio</label><textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Shadow Address</label><textarea value={editForm.shadowAddress || ''} onChange={e => setEditForm({...editForm, shadowAddress: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
              <div className="flex gap-4"><button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Save Changes</button><button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10">
            {!scrapedPreview ? (
              <form onSubmit={handleScrape} className="space-y-8">
                <input required type="url" value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="Paste product link..." className="w-full px-8 py-5 rounded-[2rem] border-2" />
                <button type="submit" disabled={isScraping} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-bold">Analyze Product</button>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl flex gap-6">
                  <img src={scrapedPreview.imageUrl || `https://picsum.photos/seed/p/100`} className="w-24 h-24 rounded-xl" />
                  <div><h3 className="font-bold text-xl">{scrapedPreview.name}</h3><p className="text-indigo-600 font-bold">₹{scrapedPreview.price}</p></div>
                </div>
                <div className="flex gap-4"><button onClick={handleConfirmAdd} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Add to Peti</button><button onClick={() => setScrapedPreview(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button></div>
              </div>
            )}
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Remove Item?</h2>
            <p className="text-slate-500 mb-8">Permanently remove <span className="font-bold text-slate-900">{itemToDelete.name}</span>?</p>
            <div className="space-y-3"><button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold">Remove</button><button onClick={() => setItemToDelete(null)} className="w-full py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;
