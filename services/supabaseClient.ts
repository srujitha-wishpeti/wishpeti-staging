
import { createClient } from '@supabase/supabase-js';

// The project URL provided by the user.
const supabaseUrl = 'https://mhnedqrctdxxdvryqsrr.supabase.co';
// The anonymous key should be provided via environment variables.
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey!)
  : null;
