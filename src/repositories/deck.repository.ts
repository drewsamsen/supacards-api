import { BaseRepository } from './base.repository';
import { ApiError } from '../middleware/error-handler';
import { Deck } from '../models/deck';

export class DeckRepository extends BaseRepository<Deck> {
  constructor(token: string | undefined, userId: string) {
    super(token, userId, 'decks');
  }

  /**
   * Get a deck by slug
   */
  async getBySlug(slug: string): Promise<Deck | null> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*')
        .eq('slug', slug)
        .eq('user_id', this.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Record not found
        }
        throw error;
      }

      return data as Deck;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching deck by slug: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching deck by slug: Unknown error`);
    }
  }

  /**
   * Get all cards for a deck
   */
  async getCards(deckId: string): Promise<any[]> {
    try {
      // First check if the deck exists and belongs to the user
      const deck = await this.getById(deckId);
      if (!deck) {
        throw new ApiError(404, `Deck with ID ${deckId} not found`);
      }

      const { data, error } = await this.client
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching cards for deck: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching cards for deck: Unknown error`);
    }
  }

  /**
   * Archive a deck
   */
  async archive(id: string): Promise<Deck | null> {
    return this.update(id, { archived: true });
  }

  /**
   * Unarchive a deck
   */
  async unarchive(id: string): Promise<Deck | null> {
    return this.update(id, { archived: false });
  }
} 