# Findly - Local Discovery Platform

A production-grade Flutter mobile application for discovering local businesses and services in Kampala, Uganda.

## Architecture

```
findly/
├── apps/mobile/           # Flutter mobile application
├── services/api/          # StreetJS backend API
├── infrastructure/        # Docker and infrastructure configs
├── docs/                  # Documentation
└── compose.yaml           # Docker Compose for local development
```

## Technology Stack

### Mobile (Flutter)
- Flutter 3.44.8 / Dart 3.12.2
- Material 3 design system
- Riverpod for state management (subject to compatibility verification)
- Dio for HTTP client
- Flutter Router for navigation

### Backend (StreetJS)
- StreetJS 1.2.9
- TypeScript with strict mode
- PostgreSQL 14+ for persistence
- Typesense for search

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16
- Typesense 0.25

## Quick Start

### Prerequisites
- Flutter SDK 3.44+
- Dart 3.12+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 14+

### Backend Setup

1. Start infrastructure:
```bash
docker compose up -d postgres typesense
```

2. Create environment file:
```bash
cp services/api/.env.example services/api/.env
# Edit .env with your configuration
```

3. Install dependencies and run migrations:
```bash
cd services/api
npm install
npm run migrate
```

4. Start the API server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/ready` - Readiness check (verifies database connection)
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/businesses` - List published businesses
- `GET /api/v1/businesses/:id` - Get business details
- `GET /api/v1/search` - Search businesses
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/businesses/:id/favorites` - Add to favorites
- `DELETE /api/v1/businesses/:id/favorites` - Remove from favorites

### Flutter Setup

1. Create `.env` file in `apps/mobile/`:
```bash
cp apps/mobile/.env.example apps/mobile/.env
```

2. Get dependencies:
```bash
cd apps/mobile
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## Development

### Backend Development

```bash
cd services/api

# Type check
npm run typecheck

# Build
npm run build

# Run tests
npm test

# Run migrations
npm run migrate

# Start with auto-reload
npm run dev
```

### Mobile Development

```bash
cd apps/mobile

# Analyze code
flutter analyze

# Run tests
flutter test

# Build debug APK
flutter build apk --debug
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Search Configuration](docs/search.md)
- [Security](docs/security.md)
- [Data Provenance](docs/data-provenance.md)
- [Deployment](docs/deployment.md)
- [Testing](docs/testing.md)

## License

MIT
