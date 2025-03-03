import { Request, Response, NextFunction } from 'express';
import { supabase, TABLES } from '../config/supabase';
import { ApiError } from '../middleware/error-handler';
import { CreateCardDTO, UpdateCardDTO, createCardSchema, updateCardSchema } from '../models/card';
import { AuthenticatedRequest } from '../types/auth-types';

// Get all cards for the authenticated user
export const getAllCards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }
    
    // Join with decks to filter by user_id
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .select(`
        *,
        ${TABLES.DECKS}!inner (id, user_id)
      `)
      .eq(`${TABLES.DECKS}.user_id`, userId);

    if (error) {
      throw new ApiError(500, `Error fetching cards: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      results: data.length,
      data: data.map(card => {
        // Filter out the deck data
        const cardData = Object.fromEntries(
          Object.entries(card as Record<string, any>).filter(([key]) => key !== TABLES.DECKS)
        );
        return cardData;
      })
    });
  } catch (error) {
    next(error);
  }
};

// Get a single card by ID for the authenticated user
export const getCardById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // Join with decks to check user ownership
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .select(`
        *,
        ${TABLES.DECKS}!inner (id, user_id)
      `)
      .eq('id', id)
      .eq(`${TABLES.DECKS}.user_id`, userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError(404, `Card with ID ${id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error fetching card: ${error.message}`);
    }

    // Filter out the deck data
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

// Create a new card for the authenticated user
export const createCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }
    
    // Validate request body
    const validationResult = createCardSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
    }

    const newCard: CreateCardDTO = validationResult.data;

    // Check if the deck exists, is not archived, and belongs to the user
    const { data: deckData, error: deckError } = await supabase
      .from(TABLES.DECKS)
      .select('id, archived, user_id')
      .eq('id', newCard.deck_id)
      .eq('user_id', userId) // Ensure the deck belongs to the user
      .single();

    if (deckError) {
      if (deckError.code === 'PGRST116') {
        throw new ApiError(404, `Deck with ID ${newCard.deck_id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error checking deck: ${deckError.message}`);
    }

    // Check if the deck is archived
    if (deckData.archived) {
      throw new ApiError(400, `Cannot add card to archived deck with ID ${newCard.deck_id}`);
    }

    // Insert card into database
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .insert([newCard])
      .select();

    if (error) {
      throw new ApiError(500, `Error creating card: ${error.message}`);
    }

    return res.status(201).json({
      status: 'success',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update a card for the authenticated user
export const updateCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // First check if the card exists and belongs to a deck owned by the user
    const { data: cardData, error: cardError } = await supabase
      .from(TABLES.CARDS)
      .select(`
        *,
        ${TABLES.DECKS}!inner (id, user_id)
      `)
      .eq('id', id)
      .eq(`${TABLES.DECKS}.user_id`, userId)
      .single();

    if (cardError) {
      if (cardError.code === 'PGRST116') {
        throw new ApiError(404, `Card with ID ${id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error checking card: ${cardError.message}`);
    }

    // Validate request body
    const validationResult = updateCardSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
    }

    const updateData: UpdateCardDTO = validationResult.data;

    // If deck_id is being updated, check if the new deck exists, is not archived, and belongs to the user
    if (updateData.deck_id) {
      const { data: deckData, error: deckError } = await supabase
        .from(TABLES.DECKS)
        .select('id, archived, user_id')
        .eq('id', updateData.deck_id)
        .eq('user_id', userId) // Ensure the deck belongs to the user
        .single();

      if (deckError) {
        if (deckError.code === 'PGRST116') {
          throw new ApiError(404, `Deck with ID ${updateData.deck_id} not found or you don't have access to it`);
        }
        throw new ApiError(500, `Error checking deck: ${deckError.message}`);
      }

      // Check if the deck is archived
      if (deckData.archived) {
        throw new ApiError(400, `Cannot move card to archived deck with ID ${updateData.deck_id}`);
      }
    }

    // Update card in database
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new ApiError(500, `Error updating card: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete a card for the authenticated user
export const deleteCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // First check if the card exists and belongs to a deck owned by the user
    const { data: cardData, error: cardError } = await supabase
      .from(TABLES.CARDS)
      .select(`
        id,
        ${TABLES.DECKS}!inner (id, user_id)
      `)
      .eq('id', id)
      .eq(`${TABLES.DECKS}.user_id`, userId)
      .single();

    if (cardError) {
      if (cardError.code === 'PGRST116') {
        throw new ApiError(404, `Card with ID ${id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error checking card: ${cardError.message}`);
    }

    // Delete card from database
    const { error } = await supabase
      .from(TABLES.CARDS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new ApiError(500, `Error deleting card: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 