import { Injectable } from 'streetjs';
import { PgPool, StreetPostgresRepository } from 'streetjs';
import type { PgRow } from 'streetjs';

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: Date;
}

export interface FavoriteRow extends PgRow, Favorite {}

@Injectable()
export class FavoriteRepository extends StreetPostgresRepository<Favorite> {
  constructor(pool: PgPool) {
    super(pool, 'favorites');
  }

  async findByUserAndBusiness(userId: string, businessId: string): Promise<Favorite | null> {
    const result = await this.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND business_id = $2',
      [userId, businessId]
    );
    return result.rows[0] ?? null;
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<Favorite[]> {
    const result = await this.query(
      `SELECT f.*, b.name as business_name, b.slug as business_slug, b.address as business_address
       FROM favorites f
       JOIN businesses b ON f.business_id = b.id
       WHERE f.user_id = $1 AND b.status = 'published'
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  async create(data: { user_id: string; business_id: string }): Promise<Favorite> {
    const result = await this.query(
      `INSERT INTO favorites (user_id, business_id)
       VALUES ($1, $2)
       RETURNING *`,
      [data.user_id, data.business_id]
    );
    return result.rows[0];
  }

  async delete(userId: string, businessId: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM favorites WHERE user_id = $1 AND business_id = $2 RETURNING id',
      [userId, businessId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async countByUser(userId: string): Promise<number> {
    const result = await this.query(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].total, 10);
  }
}
