import { supabase } from './supabaseClient';

export async function addToCart(userId, item) {
  return supabase.from('cart_items').insert({
    user_id: userId,
    wishlist_item_id: item.id,
    title: item.title,
    image_url: item.image_url,
    price: item.price,
    store: item.store,
    product_url: item.url
  });
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
  return supabase.from('cart_items').delete().eq('id', id);
}
