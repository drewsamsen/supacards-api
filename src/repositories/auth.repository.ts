import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../utils/supabase-client';
import { ApiError } from '../middleware/error-handler';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any;
  session: any;
  access_token?: string;
  refresh_token?: string;
}

export class AuthRepository {
  private client: SupabaseClient;

  constructor(token?: string) {
    this.client = getSupabaseClient(token);
  }

  /**
   * Register a new user
   */
  async register(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new ApiError(500, 'User registration failed');
      }

      return {
        user: data.user,
        session: data.session,
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Registration error: ${error.message}`);
      }
      throw new ApiError(500, 'Registration error: Unknown error');
    }
  }

  /**
   * Login a user
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new ApiError(500, 'Login failed');
      }

      return {
        user: data.user,
        session: data.session,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(401, `Login error: ${error.message}`);
      }
      throw new ApiError(401, 'Login error: Unknown error');
    }
  }

  /**
   * Logout a user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Logout error: ${error.message}`);
      }
      throw new ApiError(500, 'Logout error: Unknown error');
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<any> {
    try {
      const { data, error } = await this.client.auth.getUser();
      
      if (error) throw error;
      
      if (!data.user) {
        throw new ApiError(401, 'User not found');
      }
      
      return data.user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(401, `Authentication error: ${error.message}`);
      }
      throw new ApiError(401, 'Authentication error: Unknown error');
    }
  }
} 