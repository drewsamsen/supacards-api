import { Request, Response, NextFunction } from 'express';
import { supabase, TABLES } from '../config/supabase';
import { ApiError } from '../middleware/error-handler';
import { CreateCardDTO, UpdateCardDTO, createCardSchema, updateCardSchema } from '../models/card';

// Get all cards
export const getAllCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In the future, we'll filter by user_id
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .select('*');

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

// Get a single card by ID
export const getCardById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError(404, `Card with ID ${id} not found`);
      }
      throw new ApiError(500, `Error fetching card: ${error.message}`);
    }

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

// Create a new card
export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validationResult = createCardSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
    }

    const newCard: CreateCardDTO = validationResult.data;

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

// Update a card
export const updateCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = updateCardSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ApiError(400, `Validation error: ${validationResult.error.message}`);
    }

    const updateData: UpdateCardDTO = validationResult.data;

    // Update card in database
    const { data, error } = await supabase
      .from(TABLES.CARDS)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new ApiError(500, `Error updating card: ${error.message}`);
    }

    if (data.length === 0) {
      throw new ApiError(404, `Card with ID ${id} not found`);
    }

    return res.status(200).json({
      status: 'success',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete a card
export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Delete card from database
    const { error } = await supabase
      .from(TABLES.CARDS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new ApiError(500, `Error deleting card: ${error.message}`);
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 