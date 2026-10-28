import { Injectable } from 'streetjs';
import { PgPool, StreetPostgresRepository } from 'streetjs';
import type { PgRow } from 'streetjs';

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  created_at: Date;
  updated_at: Date;
}

export interface UserRow extends PgRow, User {}

@Injectable()
export class UserRepository extends StreetPostgresRepository<User> {
  constructor(pool: PgPool) {
    super(pool, 'users');
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ?? null;
  }

  async create(data: { email: string; password_hash: string | null; name: string; role?: string }): Promise<User> {
    const result = await this.query(
      `INSERT INTO users (email, password_hash, name, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [data.email, data.password_hash, data.name, data.role ?? 'user']
    );
    return result.rows[0];
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  }
}
