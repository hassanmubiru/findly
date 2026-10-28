import { Controller, Get } from 'streetjs';
import type { StreetContext } from 'streetjs';
import { container } from 'streetjs';
import { PgPool } from 'streetjs/pool';

@Controller('/api/v1')
export class HealthController {
  @Get('/health')
  async health(ctx: StreetContext): Promise<void> {
    ctx.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  @Get('/ready')
  async ready(ctx: StreetContext): Promise<void> {
    const checks: { [key: string]: { status: string; latency?: number; error?: string } } = {};

    checks['config'] = { status: 'ok' };

    try {
      const pool = container.resolve<PgPool>(PgPool);
      const start = Date.now();
      await pool.query('SELECT 1');
      checks['database'] = { status: 'ok', latency: Date.now() - start };
    } catch (err) {
      checks['database'] = { status: 'error', error: String(err) };
    }

    const allHealthy = Object.values(checks).every(c => c.status === 'ok');
    ctx.json({ ready: allHealthy, checks }, allHealthy ? 200 : 503);
  }
}