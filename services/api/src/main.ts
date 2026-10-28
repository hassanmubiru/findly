import 'reflect-metadata';
import { container, Injectable } from 'streetjs';
import { streetApp } from 'streetjs/http';
import { PgPool } from 'streetjs/pool';
import { AppConfig } from './config/index.js';
import { HealthController } from './controllers/health.controller.js';
import { CategoryController } from './controllers/category.controller.js';
import { BusinessController } from './controllers/business.controller.js';
import { SearchController } from './controllers/search.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { FavoriteController } from './controllers/favorite.controller.js';
import { BusinessService } from './services/business.service.js';
import { CategoryService } from './services/category.service.js';
import { SearchService } from './services/search.service.js';
import { FavoriteService } from './services/favorite.service.js';
import { AuthService } from './services/auth.service.js';
import { TypesenseService } from './services/typesense.service.js';
import { BusinessRepository } from './repositories/business.repository.js';
import { CategoryRepository } from './repositories/category.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import { FavoriteRepository } from './repositories/favorite.repository.js';
import { StreetMigrationRunner } from 'streetjs/migrations';

async function bootstrap(): Promise<void> {
  const config = new AppConfig();
  config.load();
  container.register(AppConfig, config);

  const pool = new PgPool({
    host: config.pgHost,
    port: config.pgPort,
    user: config.pgUser,
    password: config.pgPassword,
    database: config.pgDatabase,
    minConnections: 2,
    maxConnections: 20,
  });
  await pool.initialize();
  container.register(PgPool, pool);

  const typesenseService = new TypesenseService(config.typesenseHost, config.typesensePort, config.typesenseApiKey);
  container.register(TypesenseService, typesenseService);

  const businessRepository = new BusinessRepository(pool);
  const categoryRepository = new CategoryRepository(pool);
  const userRepository = new UserRepository(pool);
  const favoriteRepository = new FavoriteRepository(pool);

  container.register(BusinessRepository, businessRepository);
  container.register(CategoryRepository, categoryRepository);
  container.register(UserRepository, userRepository);
  container.register(FavoriteRepository, favoriteRepository);

  const businessService = new BusinessService(businessRepository, typesenseService);
  const categoryService = new CategoryService(categoryRepository);
  const searchService = new SearchService(typesenseService, businessRepository);
  const favoriteService = new FavoriteService(favoriteRepository, businessRepository);
  const authService = new AuthService(userRepository, config.jwtSecret);

  container.register(BusinessService, businessService);
  container.register(CategoryService, categoryService);
  container.register(SearchService, searchService);
  container.register(FavoriteService, favoriteService);
  container.register(AuthService, authService);

  if (process.argv.includes('migrate')) {
    const runner = new StreetMigrationRunner(pool, './migrations');
    await runner.run();
    console.log('[migrations] All migrations complete.');
    await pool.close();
    process.exit(0);
    return;
  }

  const app = streetApp({
    port: config.httpPort,
    host: config.httpHost,
    uploadsDir: './uploads',
  });

  app.registerController(HealthController);
  app.registerController(CategoryController);
  app.registerController(BusinessController);
  app.registerController(SearchController);
  app.registerController(AuthController);
  app.registerController(FavoriteController);

  await app.listen();
  console.log(`[street] Listening on http://${config.httpHost}:${config.httpPort}`);

  process.once('SIGTERM', async () => {
    await app.close();
    await pool.close();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('[street] Fatal error:', err);
  process.exit(1);
});