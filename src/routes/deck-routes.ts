import { Router } from 'express';
import {
  getAllDecks,
  getDeckById,
  getCardsByDeckId,
  createDeck,
  updateDeck,
  archiveDeck,
  deleteDeck
} from '../controllers/deck-controller';

const router = Router();

// GET all decks
router.get('/', getAllDecks);

// GET a single deck
router.get('/:id', getDeckById);

// GET all cards in a deck
router.get('/:id/cards', getCardsByDeckId);

// POST a new deck
router.post('/', createDeck);

// PATCH (update) a deck
router.patch('/:id', updateDeck);

// POST to archive a deck
router.post('/:id/archive', archiveDeck);

// DELETE a deck
router.delete('/:id', deleteDeck);

export const deckRoutes = router; 