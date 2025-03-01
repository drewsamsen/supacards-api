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

(Add API documentation here or link to external documentation)

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