# Supacards API Documentation

This document provides detailed information about the Supacards API endpoints, request/response formats, and usage examples.

## Base URL

```
https://your-api-domain.com
```

Replace `your-api-domain.com` with your actual API domain.

## Authentication

Authentication is not currently implemented. It will be added in a future update.

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

Returns a list of all decks. By default, archived decks are not included.

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
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
      "archived": false,
      "created_at": "2023-03-01T12:00:00Z",
      "updated_at": "2023-03-01T12:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "JavaScript Concepts",
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
      "archived": false,
      "created_at": "2023-03-02T14:30:00Z",
      "updated_at": "2023-03-02T14:30:00Z"
    }
  ]
}
```

#### Get a Specific Deck

```
GET /api/decks/:id
```

Returns a specific deck by its ID.

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
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "archived": false,
    "created_at": "2023-03-01T12:00:00Z",
    "updated_at": "2023-03-01T12:00:00Z"
  }
}
```

#### Get All Cards in a Deck

```
GET /api/decks/:id/cards
```

Returns all cards that belong to a specific deck.

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
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:05:00Z",
      "updated_at": "2023-03-01T12:05:00Z"
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "front": "Adiós",
      "back": "Goodbye",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
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

Creates a new deck.

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| name | string | The name of the deck | Yes |
| user_id | string | The UUID of the user who owns the deck | No |

**Request Example:**

```json
{
  "name": "French Vocabulary",
  "user_id": "abc12345-e89b-12d3-a456-426614174000"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "name": "French Vocabulary",
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "archived": false,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T09:15:00Z"
  }
}
```

#### Update a Deck

```
PATCH /api/decks/:id
```

Updates an existing deck.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck to update |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| name | string | The new name of the deck | No |
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
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "archived": false,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T10:20:00Z"
  }
}
```

#### Archive a Deck

```
POST /api/decks/:id/archive
```

Archives a deck. This is a convenience endpoint that sets the `archived` flag to `true`.

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
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "archived": true,
    "created_at": "2023-03-03T09:15:00Z",
    "updated_at": "2023-03-03T11:30:00Z"
  }
}
```

#### Delete a Deck

```
DELETE /api/decks/:id
```

Deletes a deck. If the deck contains cards, it will be archived instead of deleted.

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
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
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

Returns a list of all cards.

**Response Example:**

```json
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "front": "Hola",
      "back": "Hello",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:05:00Z",
      "updated_at": "2023-03-01T12:05:00Z"
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "front": "Adiós",
      "back": "Goodbye",
      "deck_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-01T12:10:00Z",
      "updated_at": "2023-03-01T12:10:00Z"
    },
    {
      "id": "623e4567-e89b-12d3-a456-426614174005",
      "front": "Callback function",
      "back": "A function passed as an argument to another function",
      "deck_id": "223e4567-e89b-12d3-a456-426614174001",
      "user_id": "abc12345-e89b-12d3-a456-426614174000",
      "created_at": "2023-03-02T14:35:00Z",
      "updated_at": "2023-03-02T14:35:00Z"
    }
  ]
}
```

#### Get a Specific Card

```
GET /api/cards/:id
```

Returns a specific card by its ID.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card |

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "front": "Hola",
    "back": "Hello",
    "deck_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "created_at": "2023-03-01T12:05:00Z",
    "updated_at": "2023-03-01T12:05:00Z"
  }
}
```

#### Create a New Card

```
POST /api/cards
```

Creates a new card.

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| front | string | The front content of the card | Yes |
| back | string | The back content of the card | Yes |
| deck_id | string | The UUID of the deck this card belongs to | Yes |
| user_id | string | The UUID of the user who owns the card | No |

**Request Example:**

```json
{
  "front": "Bonjour",
  "back": "Hello",
  "deck_id": "523e4567-e89b-12d3-a456-426614174004",
  "user_id": "abc12345-e89b-12d3-a456-426614174000"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "723e4567-e89b-12d3-a456-426614174006",
    "front": "Bonjour",
    "back": "Hello",
    "deck_id": "523e4567-e89b-12d3-a456-426614174004",
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "created_at": "2023-03-03T14:20:00Z",
    "updated_at": "2023-03-03T14:20:00Z"
  }
}
```

#### Update a Card

```
PATCH /api/cards/:id
```

Updates an existing card.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card to update |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| front | string | The new front content of the card | No |
| back | string | The new back content of the card | No |
| deck_id | string | The UUID of the new deck this card belongs to | No |

**Request Example:**

```json
{
  "front": "Bonjour!",
  "back": "Hello (formal greeting)",
  "deck_id": "523e4567-e89b-12d3-a456-426614174004"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "723e4567-e89b-12d3-a456-426614174006",
    "front": "Bonjour!",
    "back": "Hello (formal greeting)",
    "deck_id": "523e4567-e89b-12d3-a456-426614174004",
    "user_id": "abc12345-e89b-12d3-a456-426614174000",
    "created_at": "2023-03-03T14:20:00Z",
    "updated_at": "2023-03-03T15:10:00Z"
  }
}
```

#### Delete a Card

```
DELETE /api/cards/:id
```

Deletes a card.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card to delete |

**Response:**

Status code: `204 No Content`

## Error Handling

### Common Error Responses

#### Resource Not Found

```json
{
  "status": "error",
  "message": "Card with ID 999e4567-e89b-12d3-a456-426614174999 not found"
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