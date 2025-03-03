# Supacards API Documentation

This document provides detailed information about the Supacards API endpoints, request/response formats, and usage examples.

## Base URL

```
https://your-api-domain.com
```

Replace `your-api-domain.com` with your actual API domain.

## Authentication

The API uses JWT (JSON Web Token) authentication. To access protected endpoints, you must include a valid JWT token in the Authorization header of your requests.

### Authentication Header

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

#### Register a New User

```
POST /api/auth/register
```

Creates a new user account.

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| email | string | User's email address | Yes |
| password | string | User's password (min 6 characters) | Yes |
| name | string | User's full name | Yes |

**Request Example:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response Example:**

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login

```
POST /api/auth/login
```

Authenticates a user and returns a JWT token.

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| email | string | User's email address | Yes |
| password | string | User's password | Yes |

**Request Example:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc12345-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

#### Logout

```
POST /api/auth/logout
```

Invalidates the current JWT token.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**Response Example:**

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### Protected Endpoints

All endpoints except for the authentication endpoints (`/api/auth/*`) and the health check endpoint (`/health`) require authentication. Attempting to access these endpoints without a valid token will result in a 401 Unauthorized response.

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "status": "success",
  "data": { ... },  // Contains the requested data
  "results": 10     // Only included for list endpoints, indicates the number of items returned
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error message describing what went wrong"
}
```

## Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded, no content returned (used for deletions)
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized to access the resource
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## API Endpoints

### Health Check

#### Check API Status

```
GET /health
```

Returns the current status of the API.

**Response Example:**

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Decks

#### Get All Decks

```
GET /api/decks
```

Returns a list of all decks belonging to the authenticated user. By default, archived decks are not included.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| includeArchived | boolean | Set to `true` to include archived decks. Default: `false` |

**Response Example:**

```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Spanish Vocabulary",
      "slug": "spanish-vocabulary",
      "archived": false,
      "created_at": "2023-03-01T12:00:00Z",
      "updated_at": "2023-03-01T12:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "JavaScript Concepts",
      "slug": "javascript-concepts",
      "archived": false,
      "created_at": "2023-03-02T14:30:00Z",
      "updated_at": "2023-03-02T14:30:00Z"
    }
  ]
}
```

#### Get a Specific Deck

```
GET /api/decks/id/:id
```

Returns a specific deck by its ID. The deck must belong to the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck |

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Spanish Vocabulary",
    "slug": "spanish-vocabulary",
    "archived": false,
    "created_at": "2023-03-01T12:00:00Z",
    "updated_at": "2023-03-01T12:00:00Z"
  }
}
```

#### Get a Specific Deck by Slug

```
GET /api/decks/slug/:slug
```

Returns a specific deck by its slug. The deck must belong to the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | The slug of the deck |

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Spanish Vocabulary",
    "slug": "spanish-vocabulary",
    "archived": false,
    "created_at": "2023-03-01T12:00:00Z",
    "updated_at": "2023-03-01T12:00:00Z"
  }
}
```

#### Get All Cards in a Deck

```
GET /api/decks/id/:id/cards
```

Returns all cards in a specific deck. The deck must belong to the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck |

**Response Example:**

```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "front": "Hola",
      "back": "Hello",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:05:00Z",
      "updated_at": "2023-03-01T12:05:00Z"
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "front": "Adiós",
      "back": "Goodbye",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:10:00Z",
      "updated_at": "2023-03-01T12:10:00Z"
    }
  ]
}
```

#### Get All Cards in a Deck by Slug

```
GET /api/decks/slug/:slug/cards
```

Returns all cards that belong to a specific deck identified by its slug. The deck must belong to the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | The slug of the deck |

**Response Example:**

```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "front": "Hola",
      "back": "Hello",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:05:00Z",
      "updated_at": "2023-03-01T12:05:00Z"
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "front": "Adiós",
      "back": "Goodbye",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:10:00Z",
      "updated_at": "2023-03-01T12:10:00Z"
    }
  ]
}
```

#### Create a New Deck

```
POST /api/decks
```

Creates a new deck for the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| name | string | The name of the deck | Yes |
| slug | string | Custom slug for the deck (optional, will be auto-generated if not provided) | No |

**Request Example:**

```json
{
  "name": "French Vocabulary"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "name": "French Vocabulary",
    "slug": "french-vocabulary",
    "archived": false,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T09:15:00Z"
  }
}
```

#### Update a Deck

```
PATCH /api/decks/id/:id
```

Updates a specific deck. The deck must belong to the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck to update |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| name | string | The new name of the deck | No |
| slug | string | The new slug for the deck | No |
| archived | boolean | Whether the deck is archived | No |

**Request Example:**

```json
{
  "name": "Advanced French Vocabulary",
  "archived": false
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "name": "Advanced French Vocabulary",
    "slug": "advanced-french-vocabulary",
    "archived": false,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T10:20:00Z"
  }
}
```

#### Archive a Deck

```
PATCH /api/decks/id/:id/archive
```

Archives a specific deck. The deck must belong to the authenticated user. If the deck has cards, it will be archived instead of deleted.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck to archive |

**Response Example:**

```json
{
  "status": "success",
  "message": "Deck archived successfully",
  "data": {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "name": "Advanced French Vocabulary",
    "slug": "advanced-french-vocabulary",
    "archived": true,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T11:30:00Z"
  }
}
```

#### Delete a Deck

```
DELETE /api/decks/id/:id
```

Deletes a specific deck. The deck must belong to the authenticated user. If the deck has cards, it will be archived instead of deleted.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck to delete |

**Response (Successful Deletion):**

Status code: `204 No Content`

**Response (Archived Instead of Deleted):**

```json
{
  "status": "success",
  "message": "Deck contains cards and was archived instead of deleted",
  "data": {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "name": "Advanced French Vocabulary",
    "slug": "advanced-french-vocabulary",
    "archived": true,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T12:45:00Z"
  }
}
```

### Cards

#### Get All Cards

```
GET /api/cards
```

Returns a list of all cards belonging to the authenticated user's decks.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**Response Example:**

```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "front": "¿Cómo estás?",
      "back": "How are you?",
      "deck_id": "223e4567-e89b-12d3-a456-426614174001",
      "created_at": "2023-03-01T12:00:00Z",
      "updated_at": "2023-03-01T12:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "front": "Promise",
      "back": "An object representing a value that may not be available immediately",
      "deck_id": "323e4567-e89b-12d3-a456-426614174002",
      "created_at": "2023-03-02T14:30:00Z",
      "updated_at": "2023-03-02T14:30:00Z"
    }
  ]
}
```

#### Get a Specific Card

```
GET /api/cards/id/:id
```

Returns a specific card by its ID. The card must belong to a deck owned by the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card |

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "front": "¿Cómo estás?",
    "back": "How are you?",
    "deck_id": "223e4567-e89b-12d3-a456-426614174001",
    "created_at": "2023-03-01T12:00:00Z",
    "updated_at": "2023-03-01T12:00:00Z"
  }
}
```

#### Create a New Card

```
POST /api/cards
```

Creates a new card in a deck owned by the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |
| Content-Type | application/json | Yes |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| front | string | The front side of the card | Yes |
| back | string | The back side of the card | Yes |
| deck_id | string | The UUID of the deck this card belongs to | Yes |

**Request Example:**

```json
{
  "front": "¿Cómo estás?",
  "back": "How are you?",
  "deck_id": "223e4567-e89b-12d3-a456-426614174001"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "front": "¿Cómo estás?",
    "back": "How are you?",
    "deck_id": "223e4567-e89b-12d3-a456-426614174001",
    "created_at": "2023-03-01T12:00:00Z",
    "updated_at": "2023-03-01T12:00:00Z"
  }
}
```

#### Update a Card

```
PATCH /api/cards/id/:id
```

Updates a specific card. The card must belong to a deck owned by the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |
| Content-Type | application/json | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| front | string | The front side of the card | No |
| back | string | The back side of the card | No |
| deck_id | string | The UUID of the deck to move this card to | No |

**Request Example:**

```json
{
  "front": "¿Cómo te llamas?",
  "back": "What is your name?"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "front": "¿Cómo te llamas?",
    "back": "What is your name?",
    "deck_id": "223e4567-e89b-12d3-a456-426614174001",
    "created_at": "2023-03-01T12:00:00Z",
    "updated_at": "2023-03-01T12:30:00Z"
  }
}
```

#### Delete a Card

```
DELETE /api/cards/id/:id
```

Deletes a specific card. The card must belong to a deck owned by the authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card |

**Response Example:**

```json
{
  "status": "success",
  "message": "Card deleted successfully"
}
```

## Error Handling

### Common Error Responses

#### Authentication Error

```json
{
  "status": "error",
  "message": "Authentication required. Please log in."
}
```

#### Authorization Error

```json
{
  "status": "error",
  "message": "You don't have permission to access this resource"
}
```

#### Resource Not Found

```json
{
  "status": "error",
  "message": "Card with ID 999e4567-e89b-12d3-a456-426614174999 not found or you don't have access to it"
}
```

#### Validation Error

```json
{
  "status": "error",
  "message": "Validation error: Front content is required"
}
```

#### Deck Archived Error

```json
{
  "status": "error",
  "message": "Cannot add card to archived deck with ID 523e4567-e89b-12d3-a456-426614174004"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. This may change in future versions of the API.

## Versioning

The current version of the API is v1. The version is not included in the URL path but may be in future releases.

## Support

For support or questions about the API, please contact the development team. 