import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { AuthenticatedRequest } from '../types/auth-types';
import { getSupabaseClient } from '../utils/supabase-client';

/**
 * Middleware to verify JWT token in Authorization header
 * and attach the user to the request object
 */
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    // Check if the header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided or invalid format');
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Create a new Supabase client with the token
    const supabase = getSupabaseClient(token);
    
    // Get user from token
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      throw new ApiError(401, 'Invalid or expired token');
    }
    
    // TEMPORARY LOGGING: Log user ID from token
    console.log('AUTH MIDDLEWARE - User ID from token:', data.user.id);
    console.log('AUTH MIDDLEWARE - Email:', data.user.email);
    console.log('AUTH MIDDLEWARE - Auth provider:', data.user.app_metadata?.provider);
    
    // Attach the user and token to the request object
    req.user = data.user;
    req.token = token;
    
    // If we reach here, the token is valid and user is attached to request
    next();
  } catch (error) {
    // Pass the error to the error handler
    next(error);
  }
}; 