import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { AuthenticatedRequest } from '../types/auth-types';
import { AuthRepository } from '../repositories/auth.repository';

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
    
    // Create a new auth repository with the token
    const authRepository = new AuthRepository(token);
    
    // Get user from token
    const user = await authRepository.getCurrentUser();
    
    // Attach the user and token to the request object
    req.user = user;
    req.token = token;
    
    // If we reach here, the token is valid and user is attached to request
    next();
  } catch (error) {
    // Pass the error to the error handler
    next(error);
  }
}; 