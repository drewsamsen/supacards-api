import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth-middleware';
import { register, login, logout, getCurrentUser } from '../controllers/auth-controller';
import { AuthenticatedRequest } from '../types/auth-types';

const router = Router();

// Public route - no authentication required
router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth service is running'
  });
});

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// User logout - requires authentication
router.post('/logout', verifyToken, logout);

// Get current user - requires authentication
router.get('/me', verifyToken, getCurrentUser);

// Test route - requires authentication
router.get('/protected', verifyToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'You have access to this protected route',
    user_id: req.user?.id // Now we can access the user ID
  });
});

export const authRoutes = router; 