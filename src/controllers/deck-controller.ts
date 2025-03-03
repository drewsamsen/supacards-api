import { Request, Response, NextFunction } from 'express';
import { supabase, TABLES } from '../config/supabase';
import { ApiError } from '../middleware/error-handler';
import { CreateDeckDTO, UpdateDeckDTO, createDeckSchema, updateDeckSchema } from '../models/deck';
import { AuthenticatedRequest } from '../types/auth-types';
import { verifyToken } from '../middleware/auth-middleware';

// Get all decks for the authenticated user
export const getAllDecks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get query parameter for including archived decks
    const includeArchived = req.query.includeArchived === 'true';
    
    // Get user ID from the authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }
    
    // Build query
    let query = supabase
      .from(TABLES.DECKS)
      .select('*')
      .eq('user_id', userId); // Filter by user ID
    
    // Filter out archived decks by default
    if (!includeArchived) {
      query = query.eq('archived', false);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError(500, `Error fetching decks: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      results: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get a single deck by ID for the authenticated user
export const getDeckById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    const { data, error } = await supabase
      .from(TABLES.DECKS)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Ensure the deck belongs to the user
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError(404, `Deck with ID ${id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error fetching deck: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get all cards in a deck for the authenticated user
export const getCardsByDeckId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // First check if the deck exists and belongs to the user
    const { data: deck, error: deckError } = await supabase
      .from(TABLES.DECKS)
      .select('id, archived')
      .eq('id', id)
      .eq('user_id', userId) // Ensure the deck belongs to the user
      .single();

    if (deckError) {
      if (deckError.code === 'PGRST116') {
        throw new ApiError(404, `Deck with ID ${id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error fetching deck: ${deckError.message}`);
    }

    // Optionally warn if the deck is archived
    if (deck.archived) {
      console.warn(`Fetching cards from archived deck ${id}`);
    }

    // Get all cards in the deck
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .select('*')
      .eq('deck_id', id);

    if (error) {
      throw new ApiError(500, `Error fetching cards: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      results: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Create a new deck for the authenticated user
export const createDeck = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }
    
    // Validate request body
    const validationResult = createDeckSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
    }

    const newDeck: CreateDeckDTO = {
      ...validationResult.data,
      user_id: userId // Set the user ID from the authenticated request
    };

    // Insert deck into database
    const { data, error } = await supabase
      .from(TABLES.DECKS)
      .insert([newDeck])
      .select();

    if (error) {
      throw new ApiError(500, `Error creating deck: ${error.message}`);
    }

    return res.status(201).json({
      status: 'success',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update a deck for the authenticated user
export const updateDeck = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // Validate request body
    const validationResult = updateDeckSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
    }

    const updateData: UpdateDeckDTO = validationResult.data;

    // Update deck in database, ensuring it belongs to the user
    const { data, error } = await supabase
      .from(TABLES.DECKS)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure the deck belongs to the user
      .select();

    if (error) {
      throw new ApiError(500, `Error updating deck: ${error.message}`);
    }

    if (data.length === 0) {
      throw new ApiError(404, `Deck with ID ${id} not found or you don't have access to it`);
    }

    return res.status(200).json({
      status: 'success',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Archive a deck for the authenticated user
export const archiveDeck = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // Update deck to be archived, ensuring it belongs to the user
    const { data, error } = await supabase
      .from(TABLES.DECKS)
      .update({ archived: true })
      .eq('id', id)
      .eq('user_id', userId) // Ensure the deck belongs to the user
      .select();

    if (error) {
      throw new ApiError(500, `Error archiving deck: ${error.message}`);
    }

    if (data.length === 0) {
      throw new ApiError(404, `Deck with ID ${id} not found or you don't have access to it`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Deck archived successfully',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete a deck for the authenticated user
export const deleteDeck = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'User ID not found in request');
    }

    // First check if the deck belongs to the user
    const { data: deckCheck, error: deckCheckError } = await supabase
      .from(TABLES.DECKS)
      .select('id')
      .eq('id', id)
      .eq('user_id', userId) // Ensure the deck belongs to the user
      .single();

    if (deckCheckError) {
      if (deckCheckError.code === 'PGRST116') {
        throw new ApiError(404, `Deck with ID ${id} not found or you don't have access to it`);
      }
      throw new ApiError(500, `Error checking deck ownership: ${deckCheckError.message}`);
    }

    // Check if there are any cards in this deck
    const { data: cards, error: cardsError } = await supabase
      .from(TABLES.CARDS)
      .select('id')
      .eq('deck_id', id)
      .limit(1);

    if (cardsError) {
      throw new ApiError(500, `Error checking for cards: ${cardsError.message}`);
    }

    // If the deck has cards, archive it instead of deleting
    if (cards && cards.length > 0) {
      // Update deck to be archived
      const { data, error } = await supabase
        .from(TABLES.DECKS)
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', userId) // Ensure the deck belongs to the user
        .select();

      if (error) {
        throw new ApiError(500, `Error archiving deck: ${error.message}`);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Deck contains cards and was archived instead of deleted',
        data: data[0]
      });
    }

    // If no cards, proceed with deletion
    const { error } = await supabase
      .from(TABLES.DECKS)
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure the deck belongs to the user

    if (error) {
      throw new ApiError(500, `Error deleting deck: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Deck deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 