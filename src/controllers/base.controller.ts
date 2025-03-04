import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth-types';
import { ApiError } from '../middleware/error-handler';
import { ZodSchema } from 'zod';
import { IBaseRepository, QueryOptions } from '../repositories/base.repository';

export abstract class BaseController<T> {
  protected table: string;
  protected createSchema?: ZodSchema;
  protected updateSchema?: ZodSchema;

  constructor(table: string, createSchema?: ZodSchema, updateSchema?: ZodSchema) {
    this.table = table;
    this.createSchema = createSchema;
    this.updateSchema = updateSchema;
  }

  protected abstract getRepository(req: AuthenticatedRequest): IBaseRepository<T>;

  /**
   * Get all records
   */
  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getRepository(req);
      
      // Build query options from request query parameters
      const options: QueryOptions = {};
      
      // Handle pagination
      if (req.query.page && req.query.limit) {
        options.page = parseInt(req.query.page as string, 10);
        options.limit = parseInt(req.query.limit as string, 10);
      }
      
      // Handle sorting
      if (req.query.sort) {
        options.sort = req.query.sort as string;
      }
      
      // Handle field selection
      if (req.query.fields) {
        options.select = (req.query.fields as string).replace(/,/g, ', ');
      }
      
      // Handle archived filter
      options.includeArchived = req.query.includeArchived === 'true';
      
      // Handle additional filters
      const filters: Record<string, any> = {};
      Object.keys(req.query).forEach(key => {
        // Skip special query parameters
        if (!['page', 'limit', 'sort', 'fields', 'includeArchived'].includes(key)) {
          filters[key] = req.query[key];
        }
      });
      
      if (Object.keys(filters).length > 0) {
        options.filters = filters;
      }
      
      const data = await repository.getAll(options);
      
      return res.status(200).json({
        status: 'success',
        results: data.length,
        data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single record by ID
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getRepository(req);
      const { id } = req.params;
      
      const data = await repository.getById(id);
      
      if (!data) {
        throw new ApiError(404, `${this.table} with ID ${id} not found`);
      }
      
      return res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new record
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getRepository(req);
      
      if (this.createSchema) {
        const validationResult = this.createSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }
      
      const data = await repository.create(req.body);
      
      return res.status(201).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a record
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getRepository(req);
      const { id } = req.params;
      
      if (this.updateSchema) {
        const validationResult = this.updateSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }
      
      const data = await repository.update(id, req.body);
      
      if (!data) {
        throw new ApiError(404, `${this.table} with ID ${id} not found`);
      }
      
      return res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a record
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getRepository(req);
      const { id } = req.params;
      
      const success = await repository.delete(id);
      
      if (!success) {
        throw new ApiError(404, `${this.table} with ID ${id} not found`);
      }
      
      return res.status(200).json({
        status: 'success',
        message: `${this.table} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  };
} 