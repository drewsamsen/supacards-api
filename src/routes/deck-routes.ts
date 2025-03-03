import { Router } from 'express';
import { verifyToken } from '../middleware/auth-middleware';
import { deckController } from '../controllers/deck-controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all decks
router.get('/', deckController.getAll);

// Get a specific deck by ID
router.get('/id/:id', deckController.getById);

// Get all cards in a deck
router.get('/id/:id/cards', deckController.getCards);

// Create a new deck
router.post('/', deckController.create);

// Update a deck
router.patch('/id/:id', deckController.update);

// Archive a deck
router.patch('/id/:id/archive', deckController.archive);

// Delete a deck
router.delete('/id/:id', deckController.delete);

export const deckRoutes = router; 