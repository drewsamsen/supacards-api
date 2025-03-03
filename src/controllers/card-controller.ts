import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { createCardSchema, updateCardSchema } from '../models/card';
import { AuthenticatedRequest } from '../types/auth-types';
import { TABLES } from '../utils/supabase-client';
import { BaseController } from './base.controller';
import { DatabaseService } from '../services/database.service';

interface DeckWithArchived {
  id: string;
  archived: boolean;
}

function isDeckWithArchived(obj: any): obj is DeckWithArchived {
  return obj && typeof obj === 'object' && 'id' in obj && 'archived' in obj;
}

export class CardController extends BaseController {
  constructor() {
    super(TABLES.CARDS, createCardSchema, updateCardSchema);
  }

  /**
   * Override create to check deck ownership and status
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const deckService = new DatabaseService(req.token, req.user!.id, TABLES.DECKS);
      
      // Validate request body
      if (this.createSchema) {
        const validationResult = this.createSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }

      // Check if the deck exists, is not archived, and belongs to the user
      const deck = await deckService.getById(req.body.deck_id, 'id, archived');
      
      if (!isDeckWithArchived(deck)) {
        throw new ApiError(500, 'Invalid deck data returned from database');
      }
      
      if (deck.archived) {
        throw new ApiError(400, `Cannot add card to archived deck with ID ${req.body.deck_id}`);
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
   * Override update to check deck ownership and status when moving cards
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;
      
      // Validate request body
      if (this.updateSchema) {
        const validationResult = this.updateSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }

      // If deck_id is being updated, check the new deck
      if (req.body.deck_id) {
        const deckService = new DatabaseService(req.token, req.user!.id, TABLES.DECKS);
        const deck = await deckService.getById(req.body.deck_id, 'id, archived');
        
        if (!isDeckWithArchived(deck)) {
          throw new ApiError(500, 'Invalid deck data returned from database');
        }
        
        if (deck.archived) {
          throw new ApiError(400, `Cannot move card to archived deck with ID ${req.body.deck_id}`);
        }
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
   * Override getAll to join with decks for user ownership
   */
  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const data = await service.getAll({
        select: `*, ${TABLES.DECKS}!inner (id, user_id)`
      });
      
      // Filter out the deck data from the response
      const cleanData = data.map(card => {
        const cardData = Object.fromEntries(
          Object.entries(card as Record<string, any>).filter(([key]) => key !== TABLES.DECKS)
        );
        return cardData;
      });

      return res.status(200).json({
        status: 'success',
        results: cleanData.length,
        data: cleanData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Override getById to join with decks for user ownership
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;
      
      const data = await service.getById(id, `*, ${TABLES.DECKS}!inner (id, user_id)`);
      
      // Filter out the deck data from the response
      const cardData = Object.fromEntries(
        Object.entries(data as Record<string, any>).filter(([key]) => key !== TABLES.DECKS)
      );

      return res.status(200).json({
        status: 'success',
        data: cardData
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export controller instance
export const cardController = new CardController(); 