import { Injectable } from 'streetjs';
import { TypesenseService } from './typesense.service.js';
import { BusinessRepository } from '../repositories/business.repository.js';
import { PgPool } from 'streetjs/pool';

export interface SearchResult {
  businesses: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
    city_id: string | null;
    neighborhood_id: string | null;
    category_ids: string[];
    category_names: string[];
    service_names: string[];
  }[];
  total: number;
  page: number;
  facets: {
    category_names: { value: string; count: number }[];
    neighborhood_names: { value: string; count: number }[];
  };
  query: string;
}

@Injectable()
export class SearchService {
  private fallbackPool: PgPool | null = null;

  constructor(
    private readonly typesense: TypesenseService,
    businessRepo: BusinessRepository
  ) {
    this.fallbackPool = (businessRepo as unknown as { pool: PgPool }).pool;
  }

  async search(params: {
    q: string;
    category_id?: string;
    neighborhood_id?: string;
    city_id?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
  }): Promise<SearchResult> {
    const filters: string[] = ['status := published'];

    if (params.category_id) {
      filters.push(`category_ids:=${params.category_id}`);
    }
    if (params.neighborhood_id) {
      filters.push(`neighborhood_id:=${params.neighborhood_id}`);
    }
    if (params.city_id) {
      filters.push(`city_id:=${params.city_id}`);
    }

    const filterStr = filters.join(' AND ');

    try {
      const result = await this.typesense.search('businesses', {
        q: params.q || '*',
        query_by: 'name,description,service_names,category_names',
        filter_by: filterStr,
        sort_by: params.sort_by ?? 'created_at:desc',
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
        facets: 'category_names,neighborhood_name',
      });

      return {
        businesses: result.hits.map(h => h.document as SearchResult['businesses'][0]),
        total: result.found,
        page: result.page,
        facets: {
          category_names: result.facet_counts?.find(f => f.field_name === 'category_names')?.counts ?? [],
          neighborhood_names: [],
        },
        query: params.q,
      };
    } catch (err) {
      console.error('[search] Typesense search failed, falling back to DB:', err);
      return this.fallbackSearch(params);
    }
  }

  private async fallbackSearch(params: {
    q: string;
    category_id?: string;
    neighborhood_id?: string;
    city_id?: string;
    page?: number;
    per_page?: number;
  }): Promise<SearchResult> {
    if (!this.fallbackPool) {
      return { businesses: [], total: 0, page: 1, facets: { category_names: [], neighborhood_names: [] }, query: params.q };
    }

    const offset = ((params.page ?? 1) - 1) * (params.per_page ?? 20);

    let query = 'SELECT * FROM businesses WHERE status = $1';
    const queryParams: unknown[] = ['published'];
    let idx = 2;

    if (params.q) {
      query += ` AND (name ILIKE $${idx} OR description ILIKE $${idx})`;
      queryParams.push(`%${params.q}%`);
      idx++;
    }

    if (params.neighborhood_id) {
      query += ` AND neighborhood_id = $${idx}`;
      queryParams.push(params.neighborhood_id);
      idx++;
    }

    if (params.city_id) {
      query += ` AND city_id = $${idx}`;
      queryParams.push(params.city_id);
      idx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    queryParams.push(params.per_page ?? 20, offset);

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split('LIMIT')[0];

    const [result, countResult] = await Promise.all([
      this.fallbackPool.query(query, queryParams),
      this.fallbackPool.query(countQuery, queryParams.slice(0, -2)),
    ]);

    return {
      businesses: result.rows.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        name: String(r.name),
        description: r.description as string | null,
        slug: String(r.slug),
        address: r.address as string | null,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        phone: r.phone as string | null,
        website: r.website as string | null,
        city_id: r.city_id as string | null,
        neighborhood_id: r.neighborhood_id as string | null,
        category_ids: [],
        category_names: [],
        service_names: [],
      })),
      total: parseInt(String(countResult.rows[0]?.total ?? '0'), 10),
      page: params.page ?? 1,
      facets: { category_names: [], neighborhood_names: [] },
      query: params.q ?? '',
    };
  }

  async getSuggestions(q: string, limit = 5): Promise<{ name: string; slug: string }[]> {
    try {
      const result = await this.typesense.search('businesses', {
        q,
        query_by: 'name',
        filter_by: 'status := published',
        per_page: limit,
      });

      return result.hits.map(h => ({ name: h.document.name, slug: h.document.slug }));
    } catch {
      return [];
    }
  }
}