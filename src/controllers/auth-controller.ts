import { Request, Response, NextFunction } from 'express';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/error-utils';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth-types';

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
    
    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) {
      throw new ApiError(400, `Registration failed: ${error.message}`);
    }
    
    // Return success response
    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at
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
    
    // Login user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new ApiError(401, `Login failed: ${error.message}`);
    }
    
    // Return success response with session and user data
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        },
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at
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
    // Token is already verified and attached to the request by the verifyToken middleware
    const token = req.token;
    
    if (token) {
      // Set the auth header for the Supabase client
      supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });
    }
    
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new ApiError(500, `Logout failed: ${error.message}`);
    }
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
}; 