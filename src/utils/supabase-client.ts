import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file.');
}

// Table names for consistency
export const TABLES = {
  CARDS: 'cards',
  DECKS: 'decks',
  USERS: 'users',
};

/**
 * Creates a new Supabase client instance with the provided auth token
 * @param authToken - The user's authentication token
 * @returns A new Supabase client instance
 */
export const getSupabaseClient = (authToken?: string) => {
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Don't persist session as this is per-request
      detectSessionInUrl: false // No need to detect session in URL for API
    },
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : undefined
    }
  });

  return client;
};

// Export a default client for non-authenticated operations
export const supabase = getSupabaseClient(); 