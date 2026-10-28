import { Controller, Get } from 'streetjs';
import type { StreetContext } from 'streetjs';
import { container } from 'streetjs';
import { SearchService } from '../services/search.service.js';

@Controller('/api/v1/search')
export class SearchController {
  @Get('/')
  async search(ctx: StreetContext): Promise<void> {
    const q = ctx.query['q'] ?? '';
    const categoryId = ctx.query['category_id'] as string | undefined;
    const neighborhoodId = ctx.query['neighborhood_id'] as string | undefined;
    const cityId = ctx.query['city_id'] as string | undefined;
    const page = parseInt(ctx.query['page'] ?? '1', 10);
    const perPage = parseInt(ctx.query['per_page'] ?? '20', 10);
    const sortBy = ctx.query['sort_by'] as string | undefined;

    const searchService = container.resolve<SearchService>(SearchService);
    const result = await searchService.search({
      q: String(q),
      category_id: categoryId,
      neighborhood_id: neighborhoodId,
      city_id: cityId,
      page,
      per_page: perPage,
      sort_by: sortBy,
    });

    ctx.json(result);
  }

  @Get('/suggestions')
  async suggestions(ctx: StreetContext): Promise<void> {
    const q = ctx.query['q'] ?? '';
    const limit = parseInt(ctx.query['limit'] ?? '5', 10);

    const searchService = container.resolve<SearchService>(SearchService);
    const suggestions = await searchService.getSuggestions(String(q), limit);

    ctx.json({ suggestions });
  }
}
