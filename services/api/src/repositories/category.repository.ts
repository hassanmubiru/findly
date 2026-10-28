import { Injectable } from 'streetjs';
import { PgPool, StreetPostgresRepository } from 'streetjs';
import type { PgRow } from 'streetjs';

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

export interface CategoryRow extends PgRow, Category {}

@Injectable()
export class CategoryRepository extends StreetPostgresRepository<Category> {
  constructor(pool: PgPool) {
    super(pool, 'categories');
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ?? null;
  }

  async findAll(): Promise<Category[]> {
    const result = await this.query(
      'SELECT * FROM categories ORDER BY sort_order ASC, name ASC'
    );
    return result.rows;
  }

  async findRootCategories(): Promise<Category[]> {
    const result = await this.query(
      'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC, name ASC'
    );
    return result.rows;
  }

  async findChildren(parentId: string): Promise<Category[]> {
    const result = await this.query(
      'SELECT * FROM categories WHERE parent_id = $1 ORDER BY sort_order ASC, name ASC',
      [parentId]
    );
    return result.rows;
  }

  async create(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const result = await this.query(
      `INSERT INTO categories (name, slug, description, icon, parent_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.slug, data.description, data.icon, data.parent_id, data.sort_order]
    );
    return result.rows[0];
  }
}
