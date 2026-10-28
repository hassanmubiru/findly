import { Injectable } from 'streetjs';
import { PgPool } from 'streetjs/pool';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class CategoryRepository {
  protected readonly tableName = 'categories';

  constructor(private readonly pool: PgPool) {}

  protected mapRow(row: Record<string, unknown>): Category {
    return {
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      description: row.description as string | null,
      icon: row.icon as string | null,
      parent_id: row.parent_id as string | null,
      sort_order: Number(row.sort_order),
      created_at: new Date(row.created_at as string),
      updated_at: new Date(row.updated_at as string),
    };
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE slug = $1`,
      [slug]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findAll(): Promise<Category[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} ORDER BY sort_order ASC, name ASC`
    );
    return result.rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async findRootCategories(): Promise<Category[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE parent_id IS NULL ORDER BY sort_order ASC, name ASC`
    );
    return result.rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async findChildren(parentId: string): Promise<Category[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE parent_id = $1 ORDER BY sort_order ASC, name ASC`,
      [parentId]
    );
    return result.rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async create(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const result = await this.pool.query(
      `INSERT INTO ${this.tableName} (name, slug, description, icon, parent_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.slug, data.description, data.icon, data.parent_id, data.sort_order]
    );
    return this.mapRow(result.rows[0]);
  }
}