import { Controller, Get, Post, Delete } from 'streetjs';
import type { StreetContext } from 'streetjs';
import { container } from 'streetjs';
import { FavoriteService } from '../services/favorite.service.js';
import { AuthService } from '../services/auth.service.js';

@Controller('/api/v1/businesses/:businessId/favorites')
export class FavoriteController {
  private getUserId(ctx: StreetContext): string | null {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.slice(7);
    const authService = container.resolve<AuthService>(AuthService);
    const payload = authService.verifyToken(token);
    return payload?.userId ?? null;
  }

  @Post('/')
  async add(ctx: StreetContext): Promise<void> {
    const userId = this.getUserId(ctx);
    if (!userId) {
      ctx.json({ error: 'Unauthorized' }, 401);
      return;
    }

    const businessId = ctx.params['businessId'];
    const favoriteService = container.resolve<FavoriteService>(FavoriteService);

    try {
      const favorite = await favoriteService.add(userId, businessId);
      ctx.json({ favorite }, 201);
    } catch (err) {
      ctx.json({ error: 'Failed to add favorite' }, 400);
    }
  }

  @Delete('/')
  async remove(ctx: StreetContext): Promise<void> {
    const userId = this.getUserId(ctx);
    if (!userId) {
      ctx.json({ error: 'Unauthorized' }, 401);
      return;
    }

    const businessId = ctx.params['businessId'];
    const favoriteService = container.resolve<FavoriteService>(FavoriteService);
    const removed = await favoriteService.remove(userId, businessId);

    ctx.json({ success: removed });
  }

  @Get('/')
  async check(ctx: StreetContext): Promise<void> {
    const userId = this.getUserId(ctx);
    if (!userId) {
      ctx.json({ error: 'Unauthorized' }, 401);
      return;
    }

    const businessId = ctx.params['businessId'];
    const favoriteService = container.resolve<FavoriteService>(FavoriteService);
    const isFavorite = await favoriteService.isFavorite(userId, businessId);

    ctx.json({ is_favorite: isFavorite });
  }
}

@Controller('/api/v1/favorites')
export class UserFavoritesController {
  private getUserId(ctx: StreetContext): string | null {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.slice(7);
    const authService = container.resolve<AuthService>(AuthService);
    const payload = authService.verifyToken(token);
    return payload?.userId ?? null;
  }

  @Get('/')
  async list(ctx: StreetContext): Promise<void> {
    const userId = this.getUserId(ctx);
    if (!userId) {
      ctx.json({ error: 'Unauthorized' }, 401);
      return;
    }

    const limit = parseInt(ctx.query['limit'] ?? '20', 10);
    const offset = parseInt(ctx.query['offset'] ?? '0', 10);

    const favoriteService = container.resolve<FavoriteService>(FavoriteService);
    const result = await favoriteService.list(userId, limit, offset);

    ctx.json({ favorites: result.favorites, total: result.total, limit, offset });
  }
}
