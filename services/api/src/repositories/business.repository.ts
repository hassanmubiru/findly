import { Injectable } from 'streetjs';
import { PgPool, StreetPostgresRepository } from 'streetjs';
import type { PgRow } from 'streetjs';

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
  status: 'draft' | 'pending' | 'published' | 'suspended' | 'archived';
  verification_status: 'unverified' | 'pending' | 'verified';
  city_id: string | null;
  neighborhood_id: string | null;
  owner_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessRow extends PgRow, Business {}

@Injectable()
export class BusinessRepository extends StreetPostgresRepository<Business> {
  constructor(pool: PgPool) {
    super(pool, 'businesses');
  }

  async findById(id: string): Promise<Business | null> {
    const result = await this.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findBySlug(slug: string): Promise<Business | null> {
    const result = await this.query(
      'SELECT * FROM businesses WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ?? null;
  }

  async findPublishedById(id: string): Promise<Business | null> {
    const result = await this.query(
      'SELECT * FROM businesses WHERE id = $1 AND status = $2',
      [id, 'published']
    );
    return result.rows[0] ?? null;
  }

  async findAllPublished(limit = 20, offset = 0): Promise<{ businesses: Business[]; total: number }> {
    const countResult = await this.query(
      'SELECT COUNT(*) as total FROM businesses WHERE status = $1',
      ['published']
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await this.query(
      `SELECT b.*, c.name as city_name, n.name as neighborhood_name
       FROM businesses b
       LEFT JOIN cities c ON b.city_id = c.id
       LEFT JOIN neighborhoods n ON b.neighborhood_id = n.id
       WHERE b.status = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      ['published', limit, offset]
    );

    return { businesses: result.rows, total };
  }

  async findByNeighborhood(neighborhoodId: string, limit = 20, offset = 0): Promise<Business[]> {
    const result = await this.query(
      `SELECT b.*, c.name as city_name, n.name as neighborhood_name
       FROM businesses b
       LEFT JOIN cities c ON b.city_id = c.id
       LEFT JOIN neighborhoods n ON b.neighborhood_id = n.id
       WHERE b.neighborhood_id = $1 AND b.status = $2
       ORDER BY b.created_at DESC
       LIMIT $3 OFFSET $4`,
      [neighborhoodId, 'published', limit, offset]
    );
    return result.rows;
  }

  async findByCategory(categoryId: string, limit = 20, offset = 0): Promise<Business[]> {
    const result = await this.query(
      `SELECT b.*, c.name as city_name, n.name as neighborhood_name
       FROM businesses b
       LEFT JOIN cities c ON b.city_id = c.id
       LEFT JOIN neighborhoods n ON b.neighborhood_id = n.id
       JOIN business_category_assignments bca ON b.id = bca.business_id
       WHERE bca.category_id = $1 AND b.status = $2
       ORDER BY b.created_at DESC
       LIMIT $3 OFFSET $4`,
      [categoryId, 'published', limit, offset]
    );
    return result.rows;
  }

  async create(data: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> {
    const result = await this.query(
      `INSERT INTO businesses (name, slug, description, address, latitude, longitude, phone, email, website, status, verification_status, city_id, neighborhood_id, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [data.name, data.slug, data.description, data.address, data.latitude, data.longitude, data.phone, data.email, data.website, data.status, data.verification_status, data.city_id, data.neighborhood_id, data.owner_id]
    );
    return result.rows[0];
  }

  async update(id: string, data: Partial<Business>): Promise<Business | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.query(
      `UPDATE businesses SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM businesses WHERE id = $1 RETURNING id',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getCategoriesForBusiness(businessId: string): Promise<string[]> {
    const result = await this.query(
      'SELECT category_id FROM business_category_assignments WHERE business_id = $1',
      [businessId]
    );
    return result.rows.map(r => r.category_id);
  }

  async getServicesForBusiness(businessId: string): Promise<string[]> {
    const result = await this.query(
      'SELECT service_id FROM business_service_assignments WHERE business_id = $1',
      [businessId]
    );
    return result.rows.map(r => r.service_id);
  }
}
