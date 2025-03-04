import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { createCardSchema, updateCardSchema, Card } from '../models/card';
import { AuthenticatedRequest } from '../types/auth-types';
import { TABLES } from '../utils/supabase-client';
import { BaseController } from './base.controller';
import { CardRepository } from '../repositories/card.repository';
import { DeckRepository } from '../repositories/deck.repository';
import { IBaseRepository } from '../repositories/base.repository';

export class CardController extends BaseController<Card> {
  constructor() {
    super(TABLES.CARDS, createCardSchema, updateCardSchema);
  }

  protected getRepository(req: AuthenticatedRequest): IBaseRepository<Card> {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new CardRepository(req.token, req.user.id);
  }

  private getCardRepository(req: AuthenticatedRequest): CardRepository {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new CardRepository(req.token, req.user.id);
  }

  private getDeckRepository(req: AuthenticatedRequest): DeckRepository {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new DeckRepository(req.token, req.user.id);
  }

  /**
   * Override create to check deck ownership and status
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const cardRepository = this.getCardRepository(req);
      const deckRepository = this.getDeckRepository(req);
      
      // Validate request body
      if (this.createSchema) {
        const validationResult = this.createSchema.safeParse(req.body);
        if (!validationResult.success) {
          throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
        }
        req.body = validationResult.data;
      }

      // Check if the deck exists, is not archived, and belongs to the user
      const deck = await deckRepository.getById(req.body.deck_id);
      
      if (!deck) {
        throw new ApiError(404, `Deck with ID ${req.body.deck_id} not found`);
      }
      
      if (deck.archived) {
        throw new ApiError(400, `Cannot add card to archived deck with ID ${req.body.deck_id}`);
      }
      
      const data = await cardRepository.createWithDeckValidation(req.body);
      
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
      const cardRepository = this.getCardRepository(req);
      const deckRepository = this.getDeckRepository(req);
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
        const deck = await deckRepository.getById(req.body.deck_id);
        
        if (!deck) {
          throw new ApiError(404, `Deck with ID ${req.body.deck_id} not found`);
        }
        
        if (deck.archived) {
          throw new ApiError(400, `Cannot move card to archived deck with ID ${req.body.deck_id}`);
        }
      }
      
      const data = await cardRepository.updateWithDeckValidation(id, req.body);
      
      if (!data) {
        throw new ApiError(404, `Card with ID ${id} not found`);
      }
      
      return res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export controller instance
export const cardController = new CardController(); 