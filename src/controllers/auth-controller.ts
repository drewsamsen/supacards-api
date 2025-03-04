import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth-types';
import { AuthRepository } from '../repositories/auth.repository';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, validationResult.error.message);
    }
    
    const { email, password, name } = validationResult.data;
    
    // Create auth repository
    const authRepository = new AuthRepository();
    
    // Register user
    const { user, session } = await authRepository.register({ email, password });
    
    // Return success response
    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, validationResult.error.message);
    }
    
    const { email, password } = validationResult.data;
    
    // Create auth repository
    const authRepository = new AuthRepository();
    
    // Login user
    const { user, session, access_token, refresh_token } = await authRepository.login({ email, password });
    
    // Return success response with session and user data
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        session: {
          access_token,
          refresh_token,
          expires_at: session?.expires_at
        },
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout a user
 */
export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Create auth repository with the user's token
    const authRepository = new AuthRepository(req.token);
    
    // Logout user
    await authRepository.logout();
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // User is already attached to the request by the verifyToken middleware
    const user = req.user;
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 