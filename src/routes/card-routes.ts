import { Router } from 'express';
import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard
} from '../controllers/card-controller';

const router = Router();

// GET all cards
router.get('/', getAllCards);

// GET a single card
router.get('/:id', getCardById);

// POST a new card
router.post('/', createCard);

// PATCH (update) a card
router.patch('/:id', updateCard);

// DELETE a card
router.delete('/:id', deleteCard);

export const cardRoutes = router; 