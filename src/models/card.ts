import { z } from 'zod';

// Card interface
export interface Card {
  id: string;
  front: string;
  back: string;
  deck_id?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// Interface for creating a new card (without id and timestamps)
export interface CreateCardDTO {
  front: string;
  back: string;
  deck_id?: string;
  user_id?: string;
}

// Interface for updating a card
export interface UpdateCardDTO {
  front?: string;
  back?: string;
  deck_id?: string;
}

// Zod schema for validating card creation
export const createCardSchema = z.object({
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  deck_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

// Zod schema for validating card updates
export const updateCardSchema = z.object({
  front: z.string().min(1, 'Front content is required').optional(),
  back: z.string().min(1, 'Back content is required').optional(),
  deck_id: z.string().uuid().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
}); 