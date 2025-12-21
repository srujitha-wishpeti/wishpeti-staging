// services/wishlist.js - Wishlist Service Functions

import { supabase } from './supabaseClient';

// Add a new wishlist item with full product details
export async function addWishlistItem(itemData) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert([itemData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all wishlist items for a user
export async function getWishlistItems(creatorId, filters = {}) {
  let query = supabase
    .from('wishlist_items')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  // Add category filter if provided
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  // Add search filter if provided
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Update a wishlist item
export const updateWishlistItem = async (itemId, updates) => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a wishlist item
export async function deleteWishlistItem(itemId) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return true;
}

// Get wishlist statistics
export async function getWishlistStats(creatorId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('category, price')
    .eq('creator_id', creatorId);

  if (error) {
    console.error("Stats fetch error:", error);
    return { totalItems: 0, categories: {}, totalValue: 0 };
  }

  const stats = {
    totalItems: data?.length || 0,
    categories: {},
    totalValue: 0
  };

  data?.forEach(item => {
    if (item.category) {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    }

    if (item.price) {
      // Handle both string prices like "$1,200" and number prices like 1200
      const priceStr = String(item.price);
      const priceValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceValue)) {
        stats.totalValue += priceValue;
      }
    }
  });

  return stats;
}

// Update item variants (size, color, etc.)
export async function updateItemVariants(itemId, variants) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update({ variants })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}