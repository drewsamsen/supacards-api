# Decks

This document describes the endpoints for managing flashcard decks in the Supacards API.

## Deck Object

A deck object represents a collection of flashcards. It has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique identifier (UUID) |
| name | string | Name of the deck |
| slug | string | URL-friendly version of the name |
| archived | boolean | Whether the deck is archived |
| created_at | string | Creation timestamp (ISO 8601) |
| updated_at | string | Last update timestamp (ISO 8601) |

Example:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Spanish Vocabulary",
  "slug": "spanish-vocabulary",
  "archived": false,
  "created_at": "2023-03-01T12:00:00Z",
  "updated_at": "2023-03-01T12:00:00Z"
}
```

## Endpoints

All deck endpoints require authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get All Decks

```
GET /api/decks
```

Returns a list of all decks belonging to the authenticated user. By default, archived decks are not included.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| includeArchived | boolean | Set to `true` to include archived decks | `false` |
| page | number | Page number for pagination | 1 |
| limit | number | Number of items per page | 20 |

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

### Get a Specific Deck by ID

```
GET /api/decks/id/:id
```

Returns a specific deck by its ID. The deck must belong to the authenticated user.

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided ID |

### Get a Specific Deck by Slug

```
GET /api/decks/slug/:slug
```

Returns a specific deck by its slug. The deck must belong to the authenticated user.

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided slug |

### Get All Cards in a Deck by ID

```
GET /api/decks/id/:id/cards
```

Returns all cards in a specific deck. The deck must belong to the authenticated user.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck |

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
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
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided ID |

### Get All Cards in a Deck by Slug

```
GET /api/decks/slug/:slug/cards
```

Returns all cards that belong to a specific deck identified by its slug. The deck must belong to the authenticated user.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | The slug of the deck |

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
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
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided slug |

### Create a New Deck

```
POST /api/decks
```

Creates a new deck for the authenticated user.

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Name is required" | Missing name field |
| 400 | "Slug is already in use" | The provided slug is already taken |
| 401 | "Unauthorized" | Missing or invalid token |

### Update a Deck

```
PATCH /api/decks/id/:id
```

Updates a specific deck. The deck must belong to the authenticated user.

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "No fields to update" | Request body is empty |
| 400 | "Slug is already in use" | The provided slug is already taken |
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided ID |

### Archive a Deck

```
PATCH /api/decks/id/:id/archive
```

Archives a specific deck. The deck must belong to the authenticated user.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck to archive |

**Response Example:**

```json
{
  "status": "success",
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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided ID |

### Delete a Deck

```
DELETE /api/decks/id/:id
```

Deletes a specific deck. The deck must belong to the authenticated user. If the deck contains cards, it will be archived instead of deleted.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The UUID of the deck to delete |

**Response Example (Deleted):**

```json
{
  "status": "success",
  "message": "Deck deleted successfully"
}
```

**Response Example (Archived):**

```json
{
  "status": "success",
  "message": "Deck contains cards and has been archived instead of deleted",
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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |
| 403 | "Forbidden" | The deck does not belong to the user |
| 404 | "Deck not found" | No deck with the provided ID |

## Client Implementation Examples

### JavaScript/TypeScript

```javascript
// Get all decks
async function getDecks() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('https://api.supacards.com/api/decks', {
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

// Create a new deck
async function createDeck(name) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('https://api.supacards.com/api/decks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

// Get a deck by slug
async function getDeckBySlug(slug) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`https://api.supacards.com/api/decks/slug/${slug}`, {
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
```

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function DeckList() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const response = await fetch('https://api.supacards.com/api/decks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setDecks(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDecks();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div>
      <h1>My Decks</h1>
      <ul>
        {decks.map(deck => (
          <li key={deck.id}>
            <a href={`/decks/${deck.slug}`}>{deck.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
``` 