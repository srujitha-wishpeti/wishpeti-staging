import { supabase } from './supabaseClient';

export async function addToCart(userId, item) {
  // Ensure price is a clean number before inserting
  const numericPrice = typeof item.price === 'string' 
    ? Number(item.price.replace(/[^0-9.-]+/g, "")) 
    : item.price;

  const { data, error } = await supabase.from('cart_items').insert({
    user_id: userId,
    wishlist_item_id: item.id || item.product_id,
    title: item.title,
    image_url: item.image_url,
    price: numericPrice, // Store as a number
    store: item.store || 'Unknown Store',
    product_url: item.url || item.product_url
  });

  if (error) throw error;
  return data;
}

export async function getCartItems(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function removeCartItem(id) {
  const { data, error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return data;
}