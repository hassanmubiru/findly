import { Controller, Post, Get } from 'streetjs';
import type { StreetContext } from 'streetjs';
import { container } from 'streetjs';
import { AuthService } from '../services/auth.service.js';

@Controller('/api/v1/auth')
export class AuthController {
  @Post('/register')
  async register(ctx: StreetContext): Promise<void> {
    const body = ctx.body as { email: string; password: string; name: string };

    if (!body.email || !body.password || !body.name) {
      ctx.json({ error: 'Email, password, and name are required' }, 400);
      return;
    }

    const authService = container.resolve<AuthService>(AuthService);

    try {
      const result = await authService.register(body.email, body.password, body.name);
      ctx.json({ user: result.user, token: result.token }, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      ctx.json({ error: message }, 400);
    }
  }

  @Post('/login')
  async login(ctx: StreetContext): Promise<void> {
    const body = ctx.body as { email: string; password: string };

    if (!body.email || !body.password) {
      ctx.json({ error: 'Email and password are required' }, 400);
      return;
    }

    const authService = container.resolve<AuthService>(AuthService);

    try {
      const result = await authService.login(body.email, body.password);
      ctx.json({ user: result.user, token: result.token });
    } catch {
      ctx.json({ error: 'Invalid credentials' }, 401);
    }
  }

  @Get('/me')
  async me(ctx: StreetContext): Promise<void> {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      ctx.json({ error: 'Unauthorized' }, 401);
      return;
    }

    const token = authHeader.slice(7);
    const authService = container.resolve<AuthService>(AuthService);
    const payload = authService.verifyToken(token);

    if (!payload) {
      ctx.json({ error: 'Invalid token' }, 401);
      return;
    }

    const user = await authService.getUserById(payload.userId);
    if (!user) {
      ctx.json({ error: 'User not found' }, 404);
      return;
    }

    ctx.json({ user });
  }
}