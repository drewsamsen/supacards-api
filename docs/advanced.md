# Advanced Topics

This document covers advanced topics for using the Supacards API, including pagination, filtering, and sorting.

## Pagination

Most endpoints that return lists of resources support pagination to limit the number of results returned in a single request. You can use the following query parameters to control pagination:

- `page`: The page number (starting from 1)
- `limit`: The number of items per page (default: 20, max: 100)

Example:

```
GET /api/decks?page=2&limit=10
```

Pagination information is included in the response:

```json
{
  "status": "success",
  "data": [ ... ],
  "results": 10,
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalPages": 5,
    "totalResults": 47
  }
}
```

## Filtering

Many endpoints support filtering to narrow down the results based on specific criteria. Filters are applied using query parameters.

### Common Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| includeArchived | boolean | Include archived resources | `includeArchived=true` |
| deck_id | string | Filter by deck ID | `deck_id=123e4567-e89b-12d3-a456-426614174000` |
| created_after | string | Filter by creation date (ISO 8601) | `created_after=2023-01-01T00:00:00Z` |
| created_before | string | Filter by creation date (ISO 8601) | `created_before=2023-12-31T23:59:59Z` |
| updated_after | string | Filter by update date (ISO 8601) | `updated_after=2023-01-01T00:00:00Z` |
| updated_before | string | Filter by update date (ISO 8601) | `updated_before=2023-12-31T23:59:59Z` |

### Examples

Get all decks created in 2023:

```
GET /api/decks?created_after=2023-01-01T00:00:00Z&created_before=2023-12-31T23:59:59Z
```

Get all cards in a specific deck:

```
GET /api/cards?deck_id=123e4567-e89b-12d3-a456-426614174000
```

Get all decks including archived ones:

```
GET /api/decks?includeArchived=true
```

## Sorting

Many endpoints support sorting to order the results based on specific fields. Sorting is controlled using the `sort` query parameter.

The `sort` parameter accepts a comma-separated list of fields to sort by. By default, sorting is in ascending order. To sort in descending order, prefix the field name with a minus sign (`-`).

### Examples

Sort decks by name in ascending order:

```
GET /api/decks?sort=name
```

Sort decks by creation date in descending order (newest first):

```
GET /api/decks?sort=-created_at
```

Sort cards by deck ID and then by front text:

```
GET /api/cards?sort=deck_id,front
```

## Field Selection

To reduce the amount of data returned, you can specify which fields to include in the response using the `fields` query parameter. The `fields` parameter accepts a comma-separated list of field names.

### Examples

Get only the ID and name of all decks:

```
GET /api/decks?fields=id,name
```

Get specific fields for a card:

```
GET /api/cards/123e4567-e89b-12d3-a456-426614174002?fields=id,front,back
```

## Error Handling

The API returns appropriate HTTP status codes and error messages for different types of errors. Error responses have the following format:

```json
{
  "status": "error",
  "message": "Error message describing what went wrong"
}
```

For validation errors, the response includes a `errors` field with details about each validation error:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "deck_id",
      "message": "Deck ID must be a valid UUID"
    }
  ]
}
```

## Rate Limiting

To ensure fair usage of the API, rate limiting is applied. The current rate limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## Client Implementation Examples

### JavaScript/TypeScript

```javascript
// Pagination example
async function getAllDecks(page = 1, limit = 20) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`https://api.supacards.com/api/decks?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return {
      decks: data.data,
      pagination: data.pagination
    };
  } else {
    throw new Error(data.message);
  }
}

// Filtering example
async function getCardsByDeck(deckId) {
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
```

### React Hooks Example

```jsx
import { useState, useEffect } from 'react';

// Custom hook for paginated data
function usePaginatedData(endpoint, initialPage = 1, initialLimit = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    totalPages: 0,
    totalResults: 0
  });
  
  const fetchData = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`https://api.supacards.com${endpoint}?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data);
        setPagination({
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalResults: result.pagination.totalResults
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(initialPage, initialLimit);
  }, [endpoint, initialPage, initialLimit]);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData(page, pagination.limit);
    }
  };
  
  return {
    data,
    loading,
    error,
    pagination,
    goToPage,
    refresh: () => fetchData(pagination.page, pagination.limit)
  };
}