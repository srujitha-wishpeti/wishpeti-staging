
import React, { useState } from 'react';
import { useWishPeti } from '../context/WishPetiContext';
import { WishlistItem } from '../types';

const PublicWishlist: React.FC = () => {
  const { items, creator, updateItemStatus } = useWishPeti();
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [showPaymentMock, setShowPaymentMock] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    setTimeout(async () => {
      await updateItemStatus(selectedItem.id, 'fulfilled');
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const getStatusLabel = (item: WishlistItem) => {
    if (item.fulfillmentStatus === 'fulfilled') return 'Gifted! ✨';
    if (item.fulfillmentStatus === 'partial') return 'Partially Funded! 🎁';
    return 'Send this Gift';
  };

  if (!creator) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <img src={creator.avatar} className="w-24 h-24 rounded-3xl mx-auto mb-6 border-4 border-white shadow-xl" alt={creator.name} />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{creator.name}'s WishPeti</h1>
        <p className="text-slate-500 max-w-lg mx-auto">{creator.bio}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg cursor-pointer ${item.fulfillmentStatus === 'fulfilled' ? 'opacity-70' : ''}`}
            onClick={() => item.fulfillmentStatus !== 'fulfilled' && setSelectedItem(item)}
          >
            <div className="aspect-square w-full rounded-3xl overflow-hidden mb-6 bg-slate-50">
              <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
              <span className="text-indigo-600 font-bold">₹{item.price.toLocaleString('en-IN')}</span>
            </div>
            <button 
              disabled={item.fulfillmentStatus === 'fulfilled'}
              className={`w-full py-4 rounded-2xl font-bold ${item.fulfillmentStatus === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white'}`}
            >
              {getStatusLabel(item)}
            </button>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden">
            {!showPaymentMock ? (
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-8">Gift {selectedItem.name}</h2>
                <button onClick={() => setShowPaymentMock(true)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Proceed to Payment</button>
              </div>
            ) : (
              <div className="p-12 text-center">
                {paymentSuccess ? (
                  <div><h2 className="text-3xl font-bold mb-8">Gift Sent!</h2><button onClick={() => { setSelectedItem(null); setShowPaymentMock(false); setPaymentSuccess(false); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Done</button></div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold mb-8">Pay ₹{selectedItem.price.toLocaleString('en-IN')}</h2>
                    <button onClick={handlePay} disabled={isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">{isProcessing ? 'Processing...' : 'Pay Now'}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicWishlist;
