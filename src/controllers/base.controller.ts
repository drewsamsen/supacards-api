import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth-types';
import { DatabaseService } from '../services/database.service';
import { ApiError } from '../middleware/error-handler';
import { ZodSchema } from 'zod';

export class BaseController {
  protected table: string;
  protected createSchema?: ZodSchema;
  protected updateSchema?: ZodSchema;

  constructor(table: string, createSchema?: ZodSchema, updateSchema?: ZodSchema) {
    this.table = table;
    this.createSchema = createSchema;
    this.updateSchema = updateSchema;
  }

  protected getService(req: AuthenticatedRequest): DatabaseService {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new DatabaseService(req.token, req.user.id, this.table);
  }

  /**
   * Get all records
   */
  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const includeArchived = req.query.includeArchived === 'true';
      
      const data = await service.getAll({ includeArchived });
      
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
      const service = this.getService(req);
      const { id } = req.params;
      
      const data = await service.getById(id);
      
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
      const service = this.getService(req);
      
      if (this.createSchema) {
        const validationResult = this.createSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }
      
      const data = await service.create(req.body);
      
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
      const service = this.getService(req);
      const { id } = req.params;
      
      if (this.updateSchema) {
        const validationResult = this.updateSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }
      
      const data = await service.update(id, req.body);
      
      return res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Archive a record
   */
  archive = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;
      
      const data = await service.archive(id);
      
      return res.status(200).json({
        status: 'success',
        message: `${this.table} archived successfully`,
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
      const service = this.getService(req);
      const { id } = req.params;
      
      await service.delete(id);
      
      return res.status(200).json({
        status: 'success',
        message: `${this.table} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  };
} 