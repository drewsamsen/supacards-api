import { Router } from 'express';
import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard
} from '../controllers/card-controller';
import { verifyToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all card routes
router.use(verifyToken);

// Routes
router.get('/', getAllCards);
router.get('/:id', getCardById);
router.post('/', createCard);
router.patch('/:id', updateCard);
router.delete('/:id', deleteCard);

export const cardRoutes = router; 