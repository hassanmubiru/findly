import { z } from 'zod';

export class AppConfig {
  httpPort = 3000;
  httpHost = '0.0.0.0';
  pgHost = 'localhost';
  pgPort = 5432;
  pgUser = 'findly';
  pgPassword = '';
  pgDatabase = 'findly_dev';
  jwtSecret = '';
  sessionKey = '';
  typesenseHost = 'localhost';
  typesensePort = 8108;
  typesenseApiKey = '';

  load(): void {
    this.httpPort = parseInt(process.env['PORT'] ?? '3000', 10);
    this.httpHost = process.env['HOST'] ?? '0.0.0.0';
    this.pgHost = process.env['PG_HOST'] ?? 'localhost';
    this.pgPort = parseInt(process.env['PG_PORT'] ?? '5432', 10);
    this.pgUser = process.env['PG_USER'] ?? 'findly';
    this.pgPassword = process.env['PG_PASSWORD'] ?? '';
    this.pgDatabase = process.env['PG_DATABASE'] ?? 'findly_dev';
    this.jwtSecret = process.env['JWT_SECRET'] ?? '';
    this.sessionKey = process.env['SESSION_KEY'] ?? '';
    this.typesenseHost = process.env['TYPESENSE_HOST'] ?? 'localhost';
    this.typesensePort = parseInt(process.env['TYPESENSE_PORT'] ?? '8108', 10);
    this.typesenseApiKey = process.env['TYPESENSE_API_KEY'] ?? '';
  }
}
