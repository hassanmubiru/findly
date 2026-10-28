import { Injectable } from 'streetjs';

export interface BusinessDocument {
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
  city_name: string | null;
  neighborhood_id: string | null;
  neighborhood_name: string | null;
  category_ids: string[];
  category_names: string[];
  service_names: string[];
  status: string;
  created_at: number;
}

@Injectable()
export class TypesenseService {
  private baseUrl: string;
  private headers: { [key: string]: string };

  constructor(host: string, port: number, apiKey: string) {
    this.baseUrl = `http://${host}:${port}`;
    this.headers = {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-TYPESENSE-API-KEY': apiKey } : {}),
    };
  }

  async createCollection(name: string, schema: object): Promise<void> {
    const response = await fetch(`${this.baseUrl}/collections`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(schema),
    });
    if (!response.ok && response.status !== 409) {
      throw new Error(`Failed to create collection: ${response.statusText}`);
    }
  }

  async deleteCollection(name: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/collections/${name}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete collection: ${response.statusText}`);
    }
  }

  async upsertDocument(collection: string, document: BusinessDocument): Promise<void> {
    const response = await fetch(`${this.baseUrl}/collections/${collection}/documents`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(document),
    });
    if (!response.ok) {
      throw new Error(`Failed to upsert document: ${response.statusText}`);
    }
  }

  async deleteDocument(collection: string, documentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/collections/${collection}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  async search(collection: string, params: {
    q: string;
    query_by: string;
    filter_by?: string;
    sort_by?: string;
    page?: number;
    per_page?: number;
    facets?: string;
    facet_query?: string;
  }): Promise<{
    hits: { document: BusinessDocument; highlights?: { field: string; snippet: string }[] }[];
    found: number;
    page: number;
    facet_counts?: { field_name: string; counts: { value: string; count: number }[] }[];
  }> {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.q);
    searchParams.set('query_by', params.query_by);
    if (params.filter_by) searchParams.set('filter_by', params.filter_by);
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    searchParams.set('page', String(params.page ?? 1));
    searchParams.set('per_page', String(params.per_page ?? 20));
    if (params.facets) searchParams.set('facets', params.facets);
    if (params.facet_query) searchParams.set('facet_query', params.facet_query);

    const response = await fetch(`${this.baseUrl}/collections/${collection}/documents/search?${searchParams}`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getCollection(collection: string): Promise<object> {
    const response = await fetch(`${this.baseUrl}/collections/${collection}`, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to get collection: ${response.statusText}`);
    }
    return response.json();
  }

  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}