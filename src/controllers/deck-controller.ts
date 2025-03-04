import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler';
import { createDeckSchema, updateDeckSchema, Deck } from '../models/deck';
import { AuthenticatedRequest } from '../types/auth-types';
import { TABLES } from '../utils/supabase-client';
import { BaseController } from './base.controller';
import { DeckRepository } from '../repositories/deck.repository';
import { CardRepository } from '../repositories/card.repository';
import { IBaseRepository } from '../repositories/base.repository';

interface DeckWithArchived {
  id: string;
  archived: boolean;
}

function isDeckWithArchived(obj: any): obj is DeckWithArchived {
  return obj && typeof obj === 'object' && 'id' in obj && 'archived' in obj;
}

export class DeckController extends BaseController<Deck> {
  constructor() {
    super(TABLES.DECKS, createDeckSchema, updateDeckSchema);
  }

  protected getRepository(req: AuthenticatedRequest): IBaseRepository<Deck> {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new DeckRepository(req.token, req.user.id);
  }

  private getDeckRepository(req: AuthenticatedRequest): DeckRepository {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new DeckRepository(req.token, req.user.id);
  }

  private getCardRepository(req: AuthenticatedRequest): CardRepository {
    if (!req.user?.id) {
      throw new ApiError(401, 'User ID not found in request');
    }
    return new CardRepository(req.token, req.user.id);
  }

  /**
   * Get a deck by slug
   */
  getBySlug = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getDeckRepository(req);
      const { slug } = req.params;
      
      const data = await repository.getBySlug(slug);
      
      if (!data) {
        throw new ApiError(404, `Deck with slug ${slug} not found`);
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
   * Get all cards in a deck by slug
   */
  getCardsBySlug = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const deckRepository = this.getDeckRepository(req);
      const cardRepository = this.getCardRepository(req);
      const { slug } = req.params;

      // First check if the deck exists and belongs to the user
      const deck = await deckRepository.getBySlug(slug);
      
      if (!deck) {
        throw new ApiError(404, `Deck with slug ${slug} not found`);
      }

      // Optionally warn if the deck is archived
      if (deck.archived) {
        console.warn(`Fetching cards from archived deck with slug ${slug}`);
      }

      // Get all cards in the deck
      const cards = await cardRepository.getByDeckId(deck.id);

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
      const deckRepository = this.getDeckRepository(req);
      const { id } = req.params;

      // First check if the deck exists and belongs to the user
      const deck = await deckRepository.getById(id);
      
      if (!deck) {
        throw new ApiError(404, `Deck with ID ${id} not found`);
      }

      // Optionally warn if the deck is archived
      if (deck.archived) {
        console.warn(`Fetching cards from archived deck ${id}`);
      }

      // Get all cards in the deck
      const cards = await deckRepository.getCards(id);

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
   * Archive a deck
   */
  archive = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const repository = this.getDeckRepository(req);
      const { id } = req.params;
      
      const data = await repository.archive(id);
      
      if (!data) {
        throw new ApiError(404, `Deck with ID ${id} not found`);
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Deck archived successfully',
        data
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
      const deckRepository = this.getDeckRepository(req);
      const cardRepository = this.getCardRepository(req);
      const { id } = req.params;

      // First check if the deck exists and belongs to the user
      const deck = await deckRepository.getById(id);
      
      if (!deck) {
        throw new ApiError(404, `Deck with ID ${id} not found`);
      }

      // Check if there are any cards in this deck
      const cards = await cardRepository.getByDeckId(id);

      // If the deck has cards, archive it instead of deleting
      if (cards.length > 0) {
        const data = await deckRepository.archive(id);
        return res.status(200).json({
          status: 'success',
          message: 'Deck contains cards and was archived instead of deleted',
          data
        });
      }

      // If no cards, proceed with deletion
      const success = await deckRepository.delete(id);

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