
import { WishlistItem, User, FulfillmentStatus, Creator } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_ITEMS, MOCK_CREATOR } from '../constants';

const STORAGE_KEY = 'wishpeti_items_db';
const AUTH_KEY = 'wishpeti_user_session';
const PROFILE_KEY = 'wishpeti_creator_profile';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  isMock: !isSupabaseConfigured,

  // --- Auth ---
  login: async (email: string) => {
    if (!isSupabaseConfigured) {
      await delay(800);
      const user = { id: 'u1', username: 'demo_creator', email, isCreator: true };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return true;
    }
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return true;
  },

  logout: async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(AUTH_KEY);
      return;
    }
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (!isSupabaseConfigured) {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    }
    const { data: { session } } = await supabase!.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email || '',
      username: session.user.user_metadata.username || session.user.email?.split('@')[0],
      isCreator: true
    };
  },

  // --- Profile ---
  getCreatorProfile: async (): Promise<Creator> => {
    if (!isSupabaseConfigured) {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : MOCK_CREATOR;
    }
    const { data: { user } } = await supabase!.auth.getUser();
    const { data, error } = await supabase!.from('creator_profiles').select('*').eq('id', user?.id).single();
    if (error || !data) return MOCK_CREATOR;
    return data as Creator;
  },

  updateCreatorProfile: async (profile: Creator) => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return;
    }
    const { error } = await supabase!.from('creator_profiles').upsert({ ...profile });
    if (error) throw error;
  },

  // --- Wishlist ---
  getItems: async (): Promise<WishlistItem[]> => {
    if (!isSupabaseConfigured) {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ITEMS));
        return MOCK_ITEMS;
      }
      return JSON.parse(data);
    }
    const { data, error } = await supabase!.from('wishlist_items').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data as WishlistItem[];
  },
  
  addItem: async (item: Omit<WishlistItem, 'id'>) => {
    const defaultItem = { 
      ...item, 
      fulfillmentStatus: item.fulfillmentStatus || 'active',
      isFulfilled: item.fulfillmentStatus === 'fulfilled'
    };
    if (!isSupabaseConfigured) {
      const items = await api.getItems();
      const newItem = { ...defaultItem, id: Date.now().toString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...items]));
      return;
    }
    const { data: { user } } = await supabase!.auth.getUser();
    const { error } = await supabase!.from('wishlist_items').insert([{ ...defaultItem, creator_id: user?.id }]);
    if (error) throw error;
  },

  deleteItem: async (id: string) => {
    if (!isSupabaseConfigured) {
      const items = await api.getItems();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter(i => i.id !== id)));
      return;
    }
    const { error } = await supabase!.from('wishlist_items').delete().eq('id', id);
    if (error) throw error;
  },

  updateFulfillmentStatus: async (id: string, status: FulfillmentStatus) => {
    if (!isSupabaseConfigured) {
      const items = await api.getItems();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(i => i.id === id ? { 
        ...i, fulfillmentStatus: status, isFulfilled: status === 'fulfilled' 
      } : i)));
      return;
    }
    const { error } = await supabase!.from('wishlist_items').update({ fulfillmentStatus: status, isFulfilled: status === 'fulfilled' }).eq('id', id);
    if (error) throw error;
  }
};
