import { Injectable } from 'streetjs';
import { PgPool } from 'streetjs/pool';

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: Date;
}

@Injectable()
export class FavoriteRepository {
  protected readonly tableName = 'favorites';

  constructor(private readonly pool: PgPool) {}

  protected mapRow(row: Record<string, unknown>): Favorite {
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      business_id: String(row.business_id),
      created_at: new Date(row.created_at as string),
    };
  }

  async findByUserAndBusiness(userId: string, businessId: string): Promise<Favorite | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE user_id = $1 AND business_id = $2`,
      [userId, businessId]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<Favorite[]> {
    const result = await this.pool.query(
      `SELECT f.*, b.name as business_name, b.slug as business_slug, b.address as business_address
       FROM ${this.tableName} f
       JOIN businesses b ON f.business_id = b.id
       WHERE f.user_id = $1 AND b.status = 'published'
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async create(data: { user_id: string; business_id: string }): Promise<Favorite> {
    const result = await this.pool.query(
      `INSERT INTO ${this.tableName} (user_id, business_id)
       VALUES ($1, $2)
       RETURNING *`,
      [data.user_id, data.business_id]
    );
    return this.mapRow(result.rows[0]);
  }

  async deleteByUserAndBusiness(userId: string, businessId: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE user_id = $1 AND business_id = $2 RETURNING id`,
      [userId, businessId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async countByUser(userId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE user_id = $1`,
      [userId]
    );
    return parseInt(String(result.rows[0]?.total ?? '0'), 10);
  }
}