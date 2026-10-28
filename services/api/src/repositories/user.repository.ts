import { Injectable } from 'streetjs';
import { PgPool } from 'streetjs/pool';

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UserRepository {
  protected readonly tableName = 'users';

  constructor(private readonly pool: PgPool) {}

  protected mapRow(row: Record<string, unknown>): User {
    return {
      id: String(row.id),
      email: String(row.email),
      password_hash: row.password_hash as string | null,
      name: String(row.name),
      role: String(row.role),
      status: String(row.status),
      created_at: new Date(row.created_at as string),
      updated_at: new Date(row.updated_at as string),
    };
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data: { email: string; password_hash: string | null; name: string; role?: string }): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO ${this.tableName} (email, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [data.email, data.password_hash, data.name, data.role ?? 'user']
    );
    return this.mapRow(result.rows[0]);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.pool.query(
      `UPDATE ${this.tableName} SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, userId]
    );
  }
}