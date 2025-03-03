# Authentication

This document describes the authentication system used by the Supacards API, including the available endpoints and authentication flows.

## Authentication Flow

Supacards API uses JWT (JSON Web Token) for authentication. The authentication flow is as follows:

1. Register a new user account or login with existing credentials
2. Receive a JWT token in the response
3. Include the JWT token in the Authorization header of subsequent requests
4. Logout to invalidate the token when finished

## JWT Tokens

JWT tokens are used to authenticate requests to the API. Each token contains encoded information about the user and has an expiration time.

- **Token Format**: `Bearer YOUR_JWT_TOKEN`
- **Token Expiration**: 24 hours

## Authentication Header

To authenticate your requests, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Authentication Endpoints

### Register a New User

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Email is already in use" | The email address is already registered |
| 400 | "Password must be at least 6 characters" | The password is too short |
| 400 | "Invalid email format" | The email address is not valid |

### Login

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Invalid email or password" | The credentials are incorrect |
| 400 | "Email and password are required" | Missing required fields |

### Logout

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

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |

### Get Current User

```
GET /api/auth/me
```

Returns the profile of the currently authenticated user.

**Headers:**

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer YOUR_JWT_TOKEN | Yes |

**Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "created_at": "2023-02-15T09:00:00Z",
    "user_metadata": {
      "name": "John Doe"
    }
  }
}
```

**Possible Errors:**

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized" | Missing or invalid token |

## Security Best Practices

1. **Store tokens securely**: In web applications, store tokens in HttpOnly cookies or secure storage mechanisms.
2. **Handle token expiration**: Redirect users to the login page when tokens expire.
3. **Use HTTPS**: Always use HTTPS to encrypt data in transit, including authentication requests.
4. **Implement logout**: Always provide a way for users to logout and invalidate their tokens.

## Client Implementation Examples

### JavaScript/TypeScript

```javascript
// Login example
async function login(email, password) {
  const response = await fetch('https://api.supacards.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    // Store the token
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
}

// Making authenticated requests
async function fetchDecks() {
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
```

### React Hooks Example

```jsx
import { useState, useEffect } from 'react';

// Custom hook for authentication
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      fetch('https://api.supacards.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setUser(data.data);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('token');
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (email, password) => {
    // Implementation of login
  };
  
  const logout = () => {
    // Implementation of logout
  };
  
  return { user, loading, login, logout };
}
``` 