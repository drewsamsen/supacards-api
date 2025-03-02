import { z } from 'zod';

// Deck interface
export interface Deck {
  id: string;
  name: string;
  user_id?: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for creating a new deck (without id and timestamps)
export interface CreateDeckDTO {
  name: string;
  user_id?: string;
  archived?: boolean;
}

// Interface for updating a deck
export interface UpdateDeckDTO {
  name?: string;
  archived?: boolean;
}

// Zod schema for validating deck creation
export const createDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required'),
  user_id: z.string().uuid().optional(),
  archived: z.boolean().optional().default(false),
});

// Zod schema for validating deck updates
export const updateDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').optional(),
  archived: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
}); 