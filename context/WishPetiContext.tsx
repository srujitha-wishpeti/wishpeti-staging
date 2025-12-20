
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Creator, WishlistItem, FulfillmentStatus } from '../types';
import { api } from '../services/storage';

interface WishPetiContextType {
  user: User | null;
  creator: Creator | null;
  items: WishlistItem[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateProfile: (profile: Creator) => Promise<void>;
  addWishlistItem: (item: Omit<WishlistItem, 'id'>) => Promise<void>;
  removeWishlistItem: (id: string) => Promise<void>;
  updateItemStatus: (id: string, status: FulfillmentStatus) => Promise<void>;
  logout: () => Promise<void>;
}

const WishPetiContext = createContext<WishPetiContextType | undefined>(undefined);

export const WishPetiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [currentUser, currentProfile, currentItems] = await Promise.all([
        api.getCurrentUser(),
        api.getCreatorProfile(),
        api.getItems()
      ]);
      setUser(currentUser);
      setCreator(currentProfile);
      setItems(currentItems);
    } catch (error) {
      console.error("Failed to load app data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateProfile = async (profile: Creator) => {
    await api.updateCreatorProfile(profile);
    setCreator(profile);
  };

  const addWishlistItem = async (item: Omit<WishlistItem, 'id'>) => {
    await api.addItem(item as any);
    const updatedItems = await api.getItems();
    setItems(updatedItems);
  };

  const removeWishlistItem = async (id: string) => {
    await api.deleteItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItemStatus = async (id: string, status: FulfillmentStatus) => {
    await api.updateFulfillmentStatus(id, status);
    setItems(prev => prev.map(i => i.id === id ? { 
      ...i, 
      fulfillmentStatus: status, 
      isFulfilled: status === 'fulfilled' 
    } : i));
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setCreator(null);
    setItems([]);
  };

  return (
    <WishPetiContext.Provider value={{
      user, creator, items, isLoading, 
      refreshData, updateProfile, addWishlistItem, 
      removeWishlistItem, updateItemStatus, logout
    }}>
      {children}
    </WishPetiContext.Provider>
  );
};

export const useWishPeti = () => {
  const context = useContext(WishPetiContext);
  if (context === undefined) {
    throw new Error('useWishPeti must be used within a WishPetiProvider');
  }
  return context;
};
