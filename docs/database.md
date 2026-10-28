# Database Schema

## Entity Relationship

```
countries (1) ──── (n) cities (1) ──── (n) neighborhoods
                           │
                           │
                           └────── (n) businesses
                                      │
                                      ├── categories (many-to-many)
                                      ├── services (many-to-many)
                                      ├── opening_hours
                                      ├── images
                                      ├── contacts
                                      └── favorites (n) ──── users
```

## Tables

### Geographic Data

| Table | Description |
|-------|-------------|
| countries | Country definitions with currency |
| cities | Cities within countries |
| neighborhoods | Neighborhoods within cities |

### Business Catalog

| Table | Description |
|-------|-------------|
| businesses | Core business records |
| business_categories | Category definitions |
| business_category_assignments | Business-category relationships |
| business_services | Service definitions |
| business_service_assignments | Business-service relationships |
| business_contacts | Contact methods |
| business_opening_hours | Operating hours |
| business_images | Business photos |

### Users

| Table | Description |
|-------|-------------|
| users | User accounts |
| favorites | User-business favorites |

### Submissions

| Table | Description |
|-------|-------------|
| business_submissions | User-submitted businesses |

## Status Values

- **business.status**: draft, pending, published, suspended, archived
- **business.verification_status**: unverified, pending, verified
- **user.role**: user, moderator, admin
- **user.status**: active, suspended, deleted
- **submission.status**: pending, approved, rejected

## Indexes

```sql
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_neighborhood ON businesses(neighborhood_id);
CREATE INDEX idx_businesses_city ON businesses(city_id);
CREATE INDEX idx_businesses_created ON businesses(created_at DESC);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_business_category_assignments_category ON business_category_assignments(category_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_neighborhoods_city ON neighborhoods(city_id);
CREATE INDEX idx_cities_country ON cities(country_id);
```

## Migrations

Migrations are stored in `services/api/migrations/` and applied in order:

1. `001_initial_schema.sql` - Core tables
2. `002_seed_uganda_data.sql` - Uganda geographic data and categories
3. `003_seed_test_user.sql` - Test user

Run migrations with:
```bash
cd services/api
npm run migrate
```
