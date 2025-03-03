import { Request, Response, NextFunction } from 'express';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { ApiError } from '../middleware/error-handler';

// Extend the Express Request interface
interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

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
    
    // Get user from token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw new ApiError(401, 'Invalid or expired token');
    }
    
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