# Supacards API

A modern API for Supacards built with Express.js, TypeScript, and Supabase.

## Features

- RESTful API endpoints
- TypeScript for type safety
- Supabase integration for database and authentication
- Express.js for routing and middleware
- Zod for request validation
- Secure API with Helmet

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account and project

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/supacards-api.git
   cd supacards-api
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your Supabase credentials and other configuration.

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

### Building for Production

Build the project:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Project Structure

```
supacards-api/
├── src/                  # Source code
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── config.ts         # Configuration
│   └── index.ts          # Entry point
├── dist/                 # Compiled JavaScript
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Example environment variables
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## API Documentation

For comprehensive API documentation, please refer to the [docs folder](./docs/README.md) which contains detailed information about:

- [Getting Started](./docs/getting-started.md)
- [Authentication](./docs/authentication.md)
- [Decks](./docs/decks.md)
- [Cards](./docs/cards.md)
- [Advanced Topics](./docs/advanced.md) (pagination, filtering, sorting)

### Quick Reference

#### Health Check
- `GET /health` - Check if the API is running

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user profile

#### Decks

- `GET /api/decks` - Get all decks
  - Query parameters:
    - `includeArchived=true` - Include archived decks (default: false)
  
- `GET /api/decks/:id` - Get a specific deck by ID
  
- `GET /api/decks/:id/cards` - Get all cards in a specific deck
  
- `POST /api/decks` - Create a new deck
  - Request body:
    ```json
    {
      "name": "Deck Name",
      "user_id": "optional-user-id"
    }
    ```
  
- `PATCH /api/decks/:id` - Update a deck
  - Request body:
    ```json
    {
      "name": "New Deck Name",
      "archived": false
    }
    ```
  
- `POST /api/decks/:id/archive` - Archive a deck
  
- `DELETE /api/decks/:id` - Delete a deck
  - Note: If the deck contains cards, it will be archived instead of deleted

#### Cards

- `GET /api/cards` - Get all cards
  
- `GET /api/cards/:id` - Get a specific card by ID
  
- `POST /api/cards` - Create a new card
  - Request body:
    ```json
    {
      "front": "Card front content",
      "back": "Card back content",
      "deck_id": "required-deck-id",
      "user_id": "optional-user-id"
    }
    ```
  
- `PATCH /api/cards/:id` - Update a card
  - Request body:
    ```json
    {
      "front": "New front content",
      "back": "New back content",
      "deck_id": "new-deck-id"
    }
    ```
  
- `DELETE /api/cards/:id` - Delete a card

### Response Format

Successful responses follow this format:

```json
{
  "status": "success",
  "data": { ... },
  "results": 1  // Only for list endpoints
}
```

Error responses follow this format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Testing

Run tests:

```bash
npm test
# or
yarn test
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Deployment to Vercel

This API can be deployed to Vercel by following these steps:

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. The [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for local testing)
3. A Supabase project set up with the database schema (see `sql/DATABASE_SETUP.md`)

### Deployment Steps

1. **Fork or clone this repository to your GitHub account**

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Other
     - Build Command: `npm run vercel-build`
     - Output Directory: `dist`
     - Install Command: `npm ci`

3. **Set Environment Variables**
   - In the Vercel project settings, add the following environment variables:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_KEY`: Your Supabase service role key (or anon key with appropriate permissions)
     - `JWT_SECRET`: A secure random string for JWT token signing
     - `NODE_ENV`: Set to `production`
     - `PORT`: Set to `3000` (Vercel will override this, but it's good to have it set)

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a deployment URL (e.g., `https://supacards-api.vercel.app`)

### Verifying the Deployment

After deployment, you can verify that your API is working by:

1. Accessing the health check endpoint: `https://your-deployment-url/health`
2. Testing the API endpoints using the documentation in `API_DOCUMENTATION.md`

### Troubleshooting

If you encounter issues with your Vercel deployment:

1. Check the Vercel deployment logs for error messages
2. Verify that all environment variables are set correctly
3. Ensure your Supabase project is accessible from Vercel's servers
4. Check that the database schema is set up correctly in Supabase 