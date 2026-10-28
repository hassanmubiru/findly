import { Injectable } from 'streetjs';
import { UserRepository } from '../repositories/user.repository.js';
import { JwtService } from 'streetjs';
import * as crypto from 'node:crypto';

export interface AuthResult {
  user: { id: string; email: string; name: string; role: string };
  token: string;
}

@Injectable()
export class AuthService {
  private jwtService: JwtService;

  constructor(
    private readonly userRepo: UserRepository,
    jwtSecret: string
  ) {
    this.jwtService = new JwtService({ secret: jwtSecret });
  }

  async register(email: string, password: string, name: string): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await this.hashPassword(password);
    const user = await this.userRepo.create({ email, password_hash: passwordHash, name });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new Error('Invalid credentials');
    }

    const valid = await this.verifyPassword(password, user.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  }

  async getUserById(id: string): Promise<{ id: string; email: string; name: string; role: string } | null> {
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  verifyToken(token: string): { userId: string; email: string; role: string } | null {
    try {
      const payload = this.jwtService.verify(token) as { sub: string; email: string; role: string };
      return { userId: payload.sub, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16);
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
      });
    });
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [saltHex, keyHex] = hash.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const key = Buffer.from(keyHex, 'hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(crypto.timingSafeEqual(key, derivedKey));
      });
    });
  }
}