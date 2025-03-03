import { supabase } from '../utils/supabase-client';

/**
 * Utility functions for authentication
 */

/**
 * Get the current user session if it exists
 * @returns The current session or null if not authenticated
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  
  return data.session;
};

/**
 * Get the current user if authenticated
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  
  return data.user;
};

/**
 * Check if the provided JWT is valid
 * @param token The JWT token to validate
 * @returns Whether the token is valid
 */
export const isValidToken = async (token: string) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    return !error && !!data.user;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}; 