# Getting Started with Supacards API

This guide will help you get started with the Supacards API, providing an overview of the API, authentication methods, and basic usage patterns.

## Overview

Supacards API is a RESTful API that allows you to manage flashcard decks and cards. It provides endpoints for creating, reading, updating, and deleting decks and cards, as well as user authentication and management.

## Base URL

All API requests should be made to the following base URL:

```
https://api.supacards.com
```

For development and testing, you can use:

```
https://api-dev.supacards.com
```

## API Versioning

The current version of the API is v1. The version is included in the URL path:

```
https://api.supacards.com/v1
```

## Authentication

Most API endpoints require authentication. Supacards API uses JWT (JSON Web Token) for authentication. To authenticate your requests, you need to include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

To obtain a JWT token, you need to register and login using the [authentication endpoints](./authentication.md).

## Response Format

All API responses are returned in JSON format and follow a consistent structure:

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

## Pagination

List endpoints support pagination to limit the number of results returned in a single request. You can use the following query parameters to control pagination:

- `page`: The page number (starting from 1)
- `limit`: The number of items per page (default: 20, max: 100)

Example:

```
GET /v1/decks?page=2&limit=10
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

## Next Steps

Now that you have a basic understanding of the Supacards API, you can explore the specific endpoints for:

- [Authentication](./authentication.md)
- [Decks](./decks.md)
- [Cards](./cards.md)

For more advanced topics, check out:

- [Advanced Topics](./advanced.md) 