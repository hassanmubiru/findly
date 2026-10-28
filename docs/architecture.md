# Architecture

## System Overview

Findly is a local discovery platform for Kampala, Uganda with a Flutter mobile app and StreetJS backend.

```
findly/
├── apps/mobile/              # Flutter mobile application
│   └── lib/
│       ├── core/             # Theme, API client, constants
│       └── features/         # Feature modules
├── services/api/            # StreetJS backend
│   ├── src/
│   │   ├── controllers/      # HTTP route handlers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Database access
│   │   └── config/           # Configuration
│   └── migrations/           # SQL migrations
├── infrastructure/docker/    # Docker configs
└── compose.yaml              # Docker Compose
```

## Data Flow

1. Flutter app makes HTTP requests to StreetJS API
2. API validates requests and delegates to services
3. Services use repositories for database operations
4. PostgreSQL stores business data (source of truth)
5. Typesense provides search indexing and querying
6. API responses are serialized and returned to Flutter

## Key Components

### Backend (StreetJS)

- **Controllers**: Health, Categories, Businesses, Search, Auth, Favorites
- **Services**: BusinessService, CategoryService, SearchService, FavoriteService, AuthService, TypesenseService
- **Repositories**: BusinessRepository, CategoryRepository, UserRepository, FavoriteRepository

### Mobile (Flutter)

- **State Management**: Riverpod providers
- **Navigation**: Navigator with named routes
- **API Client**: Dio-based with typed responses
- **Screens**: Discovery, Search, Business Detail, Categories, Auth, Profile, Favorites

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/health | Health check |
| GET | /api/v1/ready | Readiness (verifies DB) |
| GET | /api/v1/categories | List all categories |
| GET | /api/v1/businesses | List published businesses |
| GET | /api/v1/businesses/:id | Get business details |
| GET | /api/v1/search | Search businesses |
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/businesses/:id/favorites | Add to favorites |
| DELETE | /api/v1/businesses/:id/favorites | Remove from favorites |

## Database Schema

- **countries**, **cities**, **neighborhoods**: Geographic hierarchy
- **businesses**: Core business catalog with status and verification
- **business_categories**, **business_services**: Categorization
- **business_category_assignments**, **business_service_assignments**: Many-to-many
- **users**: User accounts with role-based access
- **favorites**: User-business relationships
- **business_submissions**: User-submitted businesses

## Search (Typesense)

- Collection: `businesses`
- Indexed fields: name, description, category_names, service_names
- Filters: status, category_id, neighborhood_id, city_id
- Supports typo tolerance and faceted search
