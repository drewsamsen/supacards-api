import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { cardRoutes } from './routes/card-routes';
import { deckRoutes } from './routes/deck-routes';
import { authRoutes } from './routes/auth-routes';
import { errorHandler } from './middleware/error-handler';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root path health check (for easier testing)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Supacards API is running' });
});

// Error handling middleware
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app; 