import { Router } from 'express';
import { cardController } from '../controllers/card-controller';
import { verifyToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all card routes
router.use(verifyToken);

// Routes
router.get('/', cardController.getAll);
router.get('/id/:id', cardController.getById);
router.post('/', cardController.create);
router.patch('/id/:id', cardController.update);
router.delete('/id/:id', cardController.delete);

export const cardRoutes = router; 