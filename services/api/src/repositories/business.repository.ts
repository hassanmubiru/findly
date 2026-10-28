import { Injectable } from 'streetjs';
import { PgPool } from 'streetjs/pool';

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string;
  verification_status: string;
  city_id: string | null;
  neighborhood_id: string | null;
  owner_id: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class BusinessRepository {
  protected readonly tableName = 'businesses';

  constructor(private readonly pool: PgPool) {}

  protected mapRow(row: Record<string, unknown>): Business {
    return {
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      description: row.description as string | null,
      address: row.address as string | null,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
      phone: row.phone as string | null,
      email: row.email as string | null,
      website: row.website as string | null,
      status: String(row.status),
      verification_status: String(row.verification_status),
      city_id: row.city_id as string | null,
      neighborhood_id: row.neighborhood_id as string | null,
      owner_id: row.owner_id as string | null,
      created_at: new Date(row.created_at as string),
      updated_at: new Date(row.updated_at as string),
    };
  }

  async findById(id: string): Promise<Business | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Business | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE slug = $1`,
      [slug]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findPublishedById(id: string): Promise<Business | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND status = $2`,
      [id, 'published']
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findAllPublished(limit = 20, offset = 0): Promise<{ businesses: Business[]; total: number }> {
    const countResult = await this.pool.query(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE status = $1`,
      ['published']
    );
    const total = parseInt(String(countResult.rows[0]?.total ?? '0'), 10);

    const result = await this.pool.query(
      `SELECT b.*, c.name as city_name, n.name as neighborhood_name
       FROM ${this.tableName} b
       LEFT JOIN cities c ON b.city_id = c.id
       LEFT JOIN neighborhoods n ON b.neighborhood_id = n.id
       WHERE b.status = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      ['published', limit, offset]
    );

    return { businesses: result.rows.map(r => this.mapRow(r)), total };
  }

  async findByNeighborhood(neighborhoodId: string, limit = 20, offset = 0): Promise<Business[]> {
    const result = await this.pool.query(
      `SELECT b.*, c.name as city_name, n.name as neighborhood_name
       FROM ${this.tableName} b
       LEFT JOIN cities c ON b.city_id = c.id
       LEFT JOIN neighborhoods n ON b.neighborhood_id = n.id
       WHERE b.neighborhood_id = $1 AND b.status = $2
       ORDER BY b.created_at DESC
       LIMIT $3 OFFSET $4`,
      [neighborhoodId, 'published', limit, offset]
    );
    return result.rows.map(r => this.mapRow(r));
  }

  async findByCategory(categoryId: string, limit = 20, offset = 0): Promise<Business[]> {
    const result = await this.pool.query(
      `SELECT b.*, c.name as city_name, n.name as neighborhood_name
       FROM ${this.tableName} b
       LEFT JOIN cities c ON b.city_id = c.id
       LEFT JOIN neighborhoods n ON b.neighborhood_id = n.id
       JOIN business_category_assignments bca ON b.id = bca.business_id
       WHERE bca.category_id = $1 AND b.status = $2
       ORDER BY b.created_at DESC
       LIMIT $3 OFFSET $4`,
      [categoryId, 'published', limit, offset]
    );
    return result.rows.map(r => this.mapRow(r));
  }

  async create(data: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> {
    const result = await this.pool.query(
      `INSERT INTO ${this.tableName} (name, slug, description, address, latitude, longitude, phone, email, website, status, verification_status, city_id, neighborhood_id, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [data.name, data.slug, data.description, data.address, data.latitude, data.longitude, data.phone, data.email, data.website, data.status, data.verification_status, data.city_id, data.neighborhood_id, data.owner_id]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(id: string, data: Partial<Business>): Promise<Business | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const omitKeys = ['id', 'created_at'];
    for (const [key, value] of Object.entries(data)) {
      if (!omitKeys.includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getCategoriesForBusiness(businessId: string): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT category_id FROM business_category_assignments WHERE business_id = $1',
      [businessId]
    );
    return result.rows.map((r: Record<string, unknown>) => String(r.category_id));
  }

  async getServicesForBusiness(businessId: string): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT service_id FROM business_service_assignments WHERE business_id = $1',
      [businessId]
    );
    return result.rows.map((r: Record<string, unknown>) => String(r.service_id));
  }
}