# Search Configuration

## Typesense Setup

Findly uses Typesense for full-text search with typo tolerance.

### Collection Schema

```json
{
  "name": "businesses",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "name", "type": "string" },
    { "name": "description", "type": "string", "optional": true },
    { "name": "slug", "type": "string" },
    { "name": "address", "type": "string", "optional": true },
    { "name": "latitude", "type": "float", "optional": true },
    { "name": "longitude", "type": "float", "optional": true },
    { "name": "phone", "type": "string", "optional": true },
    { "name": "website", "type": "string", "optional": true },
    { "name": "city_id", "type": "string", "optional": true },
    { "name": "city_name", "type": "string", "optional": true },
    { "name": "neighborhood_id", "type": "string", "optional": true },
    { "name": "neighborhood_name", "type": "string", "optional": true },
    { "name": "category_ids", "type": "string[]", "optional": true },
    { "name": "category_names", "type": "string[]", "optional": true },
    { "name": "service_names", "type": "string[]", "optional": true },
    { "name": "status", "type": "string" },
    { "name": "created_at", "type": "int64" }
  ],
  "default_sorting_field": "created_at"
}
```

### Search Behavior

1. **Typo Tolerance**: Up to 2 character edits for words 5+ characters
2. **Faceting**: Category names and neighborhood names
3. **Filtering**: By status, category, neighborhood, city
4. **Sorting**: By relevance, created_at

### Indexing Strategy

1. Business record is persisted to PostgreSQL first
2. PostgreSQL triggers or application-level logic records indexing job
3. Background worker processes indexing queue
4. Typesense document is upserted with retry logic
5. Failed indexing attempts are logged and retried

### Fallback Search

If Typesense is unavailable, the API falls back to PostgreSQL `ILIKE` queries. This is slower but ensures availability.

### Docker Compose Configuration

```yaml
typesense:
  image: typesense/typesense:0.25.0
  environment:
    TYPESENSE_API_KEY: ${TYPESENSE_API_KEY}
    TYPESENSE_DATA_DIR: /typesense-data
  ports:
    - "8108:8108"
  volumes:
    - typesense_data:/typesense-data
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TYPESENSE_HOST | Typesense server host | localhost |
| TYPESENSE_PORT | Typesense server port | 8108 |
| TYPESENSE_API_KEY | API key for authentication | - |

### Health Check

```bash
curl http://localhost:8108/health
```
