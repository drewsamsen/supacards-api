import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../utils/supabase-client';
import { ApiError } from '../middleware/error-handler';

export class DatabaseService {
  private client: SupabaseClient;
  private userId: string;
  private table: string;

  constructor(token: string | undefined, userId: string, table: string) {
    this.client = getSupabaseClient(token);
    this.userId = userId;
    this.table = table;
  }

  /**
   * Get all records for the current user
   */
  async getAll(options: { 
    select?: string,
    filters?: Record<string, any>,
    includeArchived?: boolean 
  } = {}) {
    try {
      let query = this.client
        .from(this.table)
        .select(options.select || '*')
        .eq('user_id', this.userId);

      // Apply archived filter if applicable
      if (this.hasColumn('archived') && !options.includeArchived) {
        query = query.eq('archived', false);
      }

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching ${this.table}: Unknown error`);
    }
  }

  /**
   * Get a single record by ID for the current user
   */
  async getById(id: string, select?: string) {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select(select || '*')
        .eq('id', id)
        .eq('user_id', this.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError(404, `${this.table} with ID ${id} not found or you don't have access to it`);
        }
        throw error;
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching ${this.table}: Unknown error`);
    }
  }

  /**
   * Create a new record for the current user
   */
  async create<T extends Record<string, any>>(data: T) {
    try {
      const recordWithUser = {
        ...data,
        user_id: this.userId
      };

      const { data: created, error } = await this.client
        .from(this.table)
        .insert([recordWithUser])
        .select();

      if (error) throw error;
      return created[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error creating ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error creating ${this.table}: Unknown error`);
    }
  }

  /**
   * Update a record for the current user
   */
  async update<T extends Record<string, any>>(id: string, data: T) {
    try {
      const { data: updated, error } = await this.client
        .from(this.table)
        .update(data)
        .eq('id', id)
        .eq('user_id', this.userId)
        .select();

      if (error) throw error;
      if (!updated?.length) {
        throw new ApiError(404, `${this.table} with ID ${id} not found or you don't have access to it`);
      }

      return updated[0];
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error) {
        throw new ApiError(500, `Error updating ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error updating ${this.table}: Unknown error`);
    }
  }

  /**
   * Archive a record for the current user
   */
  async archive(id: string) {
    if (!this.hasColumn('archived')) {
      throw new ApiError(400, `${this.table} does not support archiving`);
    }

    return this.update(id, { archived: true });
  }

  /**
   * Delete a record for the current user
   */
  async delete(id: string) {
    try {
      const { error } = await this.client
        .from(this.table)
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error deleting ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error deleting ${this.table}: Unknown error`);
    }
  }

  /**
   * Check if a column exists in the table schema
   */
  private hasColumn(columnName: string): boolean {
    // In a real implementation, you might want to cache the table schema
    // or maintain a list of tables and their columns
    return ['decks'].includes(this.table) && columnName === 'archived';
  }
} 