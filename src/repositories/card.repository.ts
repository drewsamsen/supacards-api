import { BaseRepository } from './base.repository';
import { ApiError } from '../middleware/error-handler';
import { Card } from '../models/card';

export class CardRepository extends BaseRepository<Card> {
  constructor(token: string | undefined, userId: string) {
    super(token, userId, 'cards');
  }

  /**
   * Get all cards for a specific deck
   */
  async getByDeckId(deckId: string): Promise<Card[]> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*')
        .eq('deck_id', deckId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return data as Card[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ApiError(500, `Error fetching cards by deck ID: ${error.message}`);
      }
      throw new ApiError(500, `Error fetching cards by deck ID: Unknown error`);
    }
  }

  /**
   * Create a card with validation for deck ownership
   */
  async createWithDeckValidation(cardData: Partial<Card>): Promise<Card> {
    try {
      // Verify that the deck exists and belongs to the user
      const { data: deck, error: deckError } = await this.client
        .from('decks')
        .select('id')
        .eq('id', cardData.deck_id)
        .eq('user_id', this.userId)
        .single();

      if (deckError || !deck) {
        throw new ApiError(404, `Deck with ID ${cardData.deck_id} not found or does not belong to you`);
      }

      // Create the card
      return this.create(cardData);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(500, `Error creating card: ${error.message}`);
      }
      throw new ApiError(500, `Error creating card: Unknown error`);
    }
  }

  /**
   * Update a card with validation for deck ownership if deck_id is being changed
   */
  async updateWithDeckValidation(id: string, cardData: Partial<Card>): Promise<Card | null> {
    try {
      // If deck_id is being updated, verify that the new deck exists and belongs to the user
      if (cardData.deck_id) {
        const { data: deck, error: deckError } = await this.client
          .from('decks')
          .select('id')
          .eq('id', cardData.deck_id)
          .eq('user_id', this.userId)
          .single();

        if (deckError || !deck) {
          throw new ApiError(404, `Deck with ID ${cardData.deck_id} not found or does not belong to you`);
        }
      }

      // Update the card
      return this.update(id, cardData);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(500, `Error updating card: ${error.message}`);
      }
      throw new ApiError(500, `Error updating card: Unknown error`);
    }
  }
} 