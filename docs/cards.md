# Cards

This document describes the endpoints for managing flashcards in the Supacards API.

## Card Object

A card object represents a single flashcard with front and back content. It has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique identifier (UUID) |
| front | string | Content for the front of the card |
| back | string | Content for the back of the card |
| deck_id | string | UUID of the deck this card belongs to |
| created_at | string | Creation timestamp (ISO 8601) |
| updated_at | string | Last update timestamp (ISO 8601) |

Example:

```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "front": "Hola",
  "back": "Hello",
  "deck_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2023-03-01T12:05:00Z",
  "updated_at": "2023-03-01T12:05:00Z"
}
```

## Endpoints

All card endpoints require authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get All Cards

```
GET /api/cards
```

Returns a list of all cards belonging to the authenticated user across all decks.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| deck_id | string | Filter cards by deck ID | None |
| page | number | Page number for pagination | 1 |
| limit | number | Number of items per page | 20 |

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
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalResults": 2
  }
}
```

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |

### Get a Specific Card

```
GET /api/cards/:id
```

Returns a specific card by its ID. The card must belong to a deck owned by the authenticated user.

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
    "created_at": "2023-03-01T12:05:00Z",
    "updated_at": "2023-03-01T12:05:00Z"
  }
}
```

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The card does not belong to a deck owned by the user |
| 404 | "Card not found" | No card with the provided ID |

### Create a New Card

```
POST /api/cards
```

Creates a new card in a deck owned by the authenticated user.

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| front | string | Content for the front of the card | Yes |
| back | string | Content for the back of the card | Yes |
| deck_id | string | UUID of the deck this card belongs to | Yes |

**Request Example:**

```json
{
  "front": "Bonjour",
  "back": "Hello",
  "deck_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "623e4567-e89b-12d3-a456-426614174005",
    "front": "Bonjour",
    "back": "Hello",
    "deck_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2023-03-04T15:30:00Z",
    "updated_at": "2023-03-04T15:30:00Z"
  }
}
```

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Front, back, and deck_id are required" | Missing required fields |
| 400 | "Deck is archived" | Cannot add cards to an archived deck |
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided ID |

### Update a Card

```
PATCH /api/cards/:id
```

Updates a specific card. The card must belong to a deck owned by the authenticated user.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card to update |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| front | string | New content for the front of the card | No |
| back | string | New content for the back of the card | No |
| deck_id | string | UUID of the new deck this card should belong to | No |

**Request Example:**

```json
{
  "front": "Bonjour!",
  "back": "Hello (formal)"
}
```

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "623e4567-e89b-12d3-a456-426614174005",
    "front": "Bonjour!",
    "back": "Hello (formal)",
    "deck_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2023-03-04T15:30:00Z",
    "updated_at": "2023-03-04T16:45:00Z"
  }
}
```

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "No fields to update" | Request body is empty |
| 400 | "Deck is archived" | Cannot move card to an archived deck |
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The card does not belong to a deck owned by the user |
| 403 | "Forbidden" | The target deck does not belong to the user |
| 404 | "Card not found" | No card with the provided ID |
| 404 | "Deck not found" | No deck with the provided deck_id |

### Delete a Card

```
DELETE /api/cards/:id
```

Deletes a specific card. The card must belong to a deck owned by the authenticated user.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the card to delete |

**Response Example:**

```json
{
  "status": "success",
  "message": "Card deleted successfully"
}
```

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The card does not belong to a deck owned by the user |
| 404 | "Card not found" | No card with the provided ID |

## Client Implementation Examples

### JavaScript/TypeScript

```javascript
// Get all cards in a deck
async function getCardsInDeck(deckId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`https://api.supacards.com/api/cards?deck_id=${deckId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

// Create a new card
async function createCard(front, back, deckId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('https://api.supacards.com/api/cards', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ front, back, deck_id: deckId })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

// Update a card
async function updateCard(cardId, updates) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`https://api.supacards.com/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}
```

### React Component Example

```jsx
import { useState } from 'react';

function CardForm({ deckId, onCardCreated }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('https://api.supacards.com/api/cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ front, back, deck_id: deckId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setFront('');
        setBack('');
        onCardCreated(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Card</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="front">Front:</label>
        <textarea
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="back">Back:</label>
        <textarea
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Card'}
      </button>
    </form>
  );
} 