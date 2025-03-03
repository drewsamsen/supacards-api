import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { createDeckSchema, updateDeckSchema } from '../models/deck';
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

export class DeckController extends BaseController {
  constructor() {
    super(TABLES.DECKS, createDeckSchema, updateDeckSchema);
  }

  /**
   * Get a deck by slug
   */
  getBySlug = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { slug } = req.params;
      
      const data = await service.getBySlug(slug);
      
      return res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all cards in a deck by slug
   */
  getCardsBySlug = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { slug } = req.params;

      // First check if the deck exists and belongs to the user
      const deck = await service.getBySlug(slug, 'id, archived');
      
      if (!isDeckWithArchived(deck)) {
        throw new ApiError(500, 'Invalid deck data returned from database');
      }

      // Optionally warn if the deck is archived
      if (deck.archived) {
        console.warn(`Fetching cards from archived deck with slug ${slug}`);
      }

      // Get all cards in the deck
      const cardService = new DatabaseService(req.token, req.user!.id, TABLES.CARDS);
      const cards = await cardService.getAll({ 
        filters: { deck_id: deck.id }
      });

      return res.status(200).json({
        status: 'success',
        results: cards.length,
        data: cards
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all cards in a deck
   */
  getCards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;

      // First check if the deck exists and belongs to the user
      const deck = await service.getById(id, 'id, archived');
      
      if (!isDeckWithArchived(deck)) {
        throw new ApiError(500, 'Invalid deck data returned from database');
      }

      // Optionally warn if the deck is archived
      if (deck.archived) {
        console.warn(`Fetching cards from archived deck ${id}`);
      }

      // Get all cards in the deck
      const cardService = new DatabaseService(req.token, req.user!.id, TABLES.CARDS);
      const cards = await cardService.getAll({ 
        filters: { deck_id: id }
      });

      return res.status(200).json({
        status: 'success',
        results: cards.length,
        data: cards
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Override delete to handle cards
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;

      // First check if the deck exists and belongs to the user
      await service.getById(id);

      // Check if there are any cards in this deck
      const cardService = new DatabaseService(req.token, req.user!.id, TABLES.CARDS);
      const cards = await cardService.getAll({ 
        filters: { deck_id: id },
        select: 'id'
      });

      // If the deck has cards, archive it instead of deleting
      if (cards.length > 0) {
        const data = await service.archive(id);
        return res.status(200).json({
          status: 'success',
          message: 'Deck contains cards and was archived instead of deleted',
          data
        });
      }

      // If no cards, proceed with deletion
      await service.delete(id);

      return res.status(200).json({
        status: 'success',
        message: 'Deck deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export controller instance
export const deckController = new DeckController(); 