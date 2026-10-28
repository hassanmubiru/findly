import { Controller, Get, Post, Put, Delete } from 'streetjs';
import type { StreetContext } from 'streetjs';
import { container } from 'streetjs';
import { BusinessService } from '../services/business.service.js';

@Controller('/api/v1/businesses')
export class BusinessController {
  @Get('/')
  async list(ctx: StreetContext): Promise<void> {
    const limit = parseInt(ctx.query['limit'] ?? '20', 10);
    const offset = parseInt(ctx.query['offset'] ?? '0', 10);

    const businessService = container.resolve<BusinessService>(BusinessService);
    const result = await businessService.list(limit, offset);
    ctx.json({ businesses: result.businesses, total: result.total, limit, offset });
  }

  @Get('/:id')
  async getById(ctx: StreetContext): Promise<void> {
    const id = ctx.params['id'];
    const businessService = container.resolve<BusinessService>(BusinessService);

    const business = await businessService.getById(id);
    if (!business) {
      ctx.json({ error: 'Business not found' }, 404);
      return;
    }

    const categories = await businessService.getCategories(id);
    const services = await businessService.getServices(id);

    ctx.json({ business, categories, services });
  }

  @Get('/neighborhood/:neighborhoodId')
  async getByNeighborhood(ctx: StreetContext): Promise<void> {
    const neighborhoodId = ctx.params['neighborhoodId'];
    const limit = parseInt(ctx.query['limit'] ?? '20', 10);
    const offset = parseInt(ctx.query['offset'] ?? '0', 10);

    const businessService = container.resolve<BusinessService>(BusinessService);
    const businesses = await businessService.getByNeighborhood(neighborhoodId, limit, offset);
    ctx.json({ businesses, limit, offset });
  }

  @Get('/category/:categoryId')
  async getByCategory(ctx: StreetContext): Promise<void> {
    const categoryId = ctx.params['categoryId'];
    const limit = parseInt(ctx.query['limit'] ?? '20', 10);
    const offset = parseInt(ctx.query['offset'] ?? '0', 10);

    const businessService = container.resolve<BusinessService>(BusinessService);
    const businesses = await businessService.getByCategory(categoryId, limit, offset);
    ctx.json({ businesses, limit, offset });
  }

  @Post('/')
  async create(ctx: StreetContext): Promise<void> {
    const body = ctx.body as {
      name: string;
      slug: string;
      description?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      phone?: string;
      email?: string;
      website?: string;
      city_id?: string;
      neighborhood_id?: string;
      category_ids?: string[];
    };

    if (!body.name || !body.slug) {
      ctx.json({ error: 'Name and slug are required' }, 400);
      return;
    }

    const businessService = container.resolve<BusinessService>(BusinessService);
    const business = await businessService.create(body, body.category_ids ?? []);
    ctx.json({ business }, 201);
  }

  @Put('/:id')
  async update(ctx: StreetContext): Promise<void> {
    const id = ctx.params['id'];
    const body = ctx.body as Record<string, unknown>;

    const businessService = container.resolve<BusinessService>(BusinessService);
    const business = await businessService.update(id, body);

    if (!business) {
      ctx.json({ error: 'Business not found' }, 404);
      return;
    }

    ctx.json({ business });
  }

  @Delete('/:id')
  async delete(ctx: StreetContext): Promise<void> {
    const id = ctx.params['id'];
    const businessService = container.resolve<BusinessService>(BusinessService);
    const deleted = await businessService.delete(id);

    if (!deleted) {
      ctx.json({ error: 'Business not found' }, 404);
      return;
    }

    ctx.json({ success: true });
  }
}
