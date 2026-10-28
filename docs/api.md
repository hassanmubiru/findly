# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Protected endpoints require a Bearer token:

```
Authorization: Bearer <token>
```

## Endpoints

### Health

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:23:45.123Z"
}
```

#### `GET /ready`

Readiness check with dependency verification.

**Response (200):**
```json
{
  "ready": true,
  "checks": {
    "config": { "status": "ok" },
    "database": { "status": "ok", "latency": 5 }
  }
}
```

**Response (503):**
```json
{
  "ready": false,
  "checks": {
    "database": { "status": "error", "error": "Connection refused" }
  }
}
```

### Categories

#### `GET /categories`

List all categories.

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Restaurants & Food",
      "slug": "restaurants-food",
      "description": "...",
      "icon": "restaurant",
      "sort_order": 1
    }
  ]
}
```

#### `GET /categories/root`

List root-level categories (no parent).

#### `GET /categories/:id`

Get category by ID.

#### `GET /categories/:id/children`

Get child categories.

### Businesses

#### `GET /businesses`

List published businesses.

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "businesses": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### `GET /businesses/:id`

Get business details including categories and services.

**Response:**
```json
{
  "business": {
    "id": "uuid",
    "name": "Business Name",
    "description": "...",
    "address": "...",
    "phone": "...",
    "status": "published"
  },
  "categories": ["category-id-1", "category-id-2"],
  "services": ["service-id-1"]
}
```

#### `GET /businesses/neighborhood/:neighborhoodId`

Get businesses in a neighborhood.

#### `GET /businesses/category/:categoryId`

Get businesses by category.

#### `POST /businesses`

Create a new business (authenticated).

**Request:**
```json
{
  "name": "Business Name",
  "slug": "business-name",
  "description": "...",
  "address": "...",
  "phone": "...",
  "email": "...",
  "category_ids": ["uuid"]
}
```

**Response (201):**
```json
{
  "business": { ... }
}
```

#### `PUT /businesses/:id`

Update business (owner only).

#### `DELETE /businesses/:id`

Delete business (owner only).

### Search

#### `GET /search`

Search businesses.

**Query Parameters:**
- `q` - Search query
- `category_id` - Filter by category
- `neighborhood_id` - Filter by neighborhood
- `city_id` - Filter by city
- `page` (default: 1)
- `per_page` (default: 20)
- `sort_by` - e.g., "created_at:desc"

**Response:**
```json
{
  "businesses": [
    {
      "id": "uuid",
      "name": "Business Name",
      "description": "...",
      "slug": "business-name",
      "category_names": ["Restaurants"],
      "service_names": ["Delivery"]
    }
  ],
  "total": 50,
  "page": 1,
  "facets": {
    "category_names": [{ "value": "Restaurants", "count": 10 }]
  },
  "query": "restaurant"
}
```

#### `GET /search/suggestions`

Get search suggestions.

**Query Parameters:**
- `q` - Search query
- `limit` (default: 5)

**Response:**
```json
{
  "suggestions": [
    { "name": "Restaurant Name", "slug": "restaurant-name" }
  ]
}
```

### Auth

#### `POST /auth/register`

Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt-token"
}
```

#### `POST /auth/login`

Login.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### `GET /auth/me`

Get current user (authenticated).

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Favorites

#### `POST /businesses/:businessId/favorites`

Add to favorites (authenticated).

**Response (201):**
```json
{
  "favorite": { ... }
}
```

#### `DELETE /businesses/:businessId/favorites`

Remove from favorites (authenticated).

**Response:**
```json
{
  "success": true
}
```

#### `GET /businesses/:businessId/favorites`

Check if favorited (authenticated).

**Response:**
```json
{
  "is_favorite": true
}
```

#### `GET /favorites`

List user's favorites (authenticated).

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "favorites": [...],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

## Error Responses

```json
{
  "error": "Error message",
  "status": 400
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Not authorized |
| 404 | Not Found |
| 500 | Internal Server Error |
