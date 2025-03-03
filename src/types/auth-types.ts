import { Request } from 'express';
import { User } from '@supabase/supabase-js';

/**
 * Interface for requests that have been authenticated
 * and have user information attached
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
} 