import { Injectable } from 'streetjs';
import { TypesenseService } from './typesense.service.js';
import { BusinessRepository } from '../repositories/business.repository.js';

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
  constructor(
    private readonly typesense: TypesenseService,
    private readonly businessRepo: BusinessRepository
  ) {}

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
        businesses: result.hits.map(h => h.document),
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

    const { query: dbQuery } = await import('streetjs');
    const pool = (this.businessRepo as unknown as { pool: { query: typeof dbQuery } }).pool;

    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)),
    ]);

    return {
      businesses: result.rows,
      total: parseInt(countResult.rows[0]?.total ?? '0', 10),
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