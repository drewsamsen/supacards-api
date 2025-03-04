import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../utils/supabase-client';
import { ApiError } from '../middleware/error-handler';

export interface QueryOptions {
  select?: string;
  page?: number;
  limit?: number;
  sort?: string;
  filters?: Record<string, any>;
  includeArchived?: boolean;
}

export interface IBaseRepository<T> {
  getAll(options?: QueryOptions): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected client: SupabaseClient;
  protected userId: string;
  protected table: string;

  constructor(token: string | undefined, userId: string, table: string) {
    this.client = getSupabaseClient(token);
    this.userId = userId;
    this.table = table;
  }

  /**
   * Get all records for the current user
   */
  async getAll(options: QueryOptions = {}): Promise<T[]> {
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

      // Apply sorting
      if (options.sort) {
        const [field, order] = options.sort.split(':');
        query = query.order(field, { ascending: order !== 'desc' });
      }

      // Apply pagination
      if (options.page !== undefined && options.limit !== undefined) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as T[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching ${this.table}: Unknown error`);
    }
  }

  /**
   * Get a record by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*')
        .eq('id', id)
        .eq('user_id', this.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Record not found
        }
        throw error;
      }

      return data as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching ${this.table}: Unknown error`);
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      // Add user_id to the data
      const recordData = {
        ...data,
        user_id: this.userId,
      };

      const { data: newRecord, error } = await this.client
        .from(this.table)
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;
      return newRecord as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error creating ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error creating ${this.table}: Unknown error`);
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      // First check if the record exists and belongs to the user
      const existingRecord = await this.getById(id);
      if (!existingRecord) {
        return null;
      }

      const { data: updatedRecord, error } = await this.client
        .from(this.table)
        .update(data)
        .eq('id', id)
        .eq('user_id', this.userId)
        .select()
        .single();

      if (error) throw error;
      return updatedRecord as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error updating ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error updating ${this.table}: Unknown error`);
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    try {
      // First check if the record exists and belongs to the user
      const existingRecord = await this.getById(id);
      if (!existingRecord) {
        return false;
      }

      const { error } = await this.client
        .from(this.table)
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error deleting ${this.table}: ${error.message}`);
      }
      throw new ApiError(500, `Error deleting ${this.table}: Unknown error`);
    }
  }

  /**
   * Check if a column exists in the table schema
   * This is a helper method to avoid errors when filtering by columns that may not exist
   */
  protected hasColumn(columnName: string): boolean {
    // This is a simplified implementation
    // In a real application, you might want to cache the table schema
    // or use a more sophisticated approach
    return true;
  }
} 