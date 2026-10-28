import { Injectable } from 'streetjs';
import { FavoriteRepository, Favorite } from '../repositories/favorite.repository.js';
import { BusinessRepository } from '../repositories/business.repository.js';

@Injectable()
export class FavoriteService {
  constructor(
    private readonly favoriteRepo: FavoriteRepository,
    private readonly businessRepo: BusinessRepository
  ) {}

  async add(userId: string, businessId: string): Promise<Favorite> {
    const existing = await this.favoriteRepo.findByUserAndBusiness(userId, businessId);
    if (existing) {
      return existing;
    }

    const business = await this.businessRepo.findPublishedById(businessId);
    if (!business) {
      throw new Error('Business not found or not published');
    }

    return this.favoriteRepo.create({ user_id: userId, business_id: businessId });
  }

  async remove(userId: string, businessId: string): Promise<boolean> {
    return this.favoriteRepo.deleteByUserAndBusiness(userId, businessId);
  }

  async list(userId: string, limit = 20, offset = 0): Promise<{ favorites: Favorite[]; total: number }> {
    const favorites = await this.favoriteRepo.findByUser(userId, limit, offset);
    const total = await this.favoriteRepo.countByUser(userId);
    return { favorites, total };
  }

  async isFavorite(userId: string, businessId: string): Promise<boolean> {
    const favorite = await this.favoriteRepo.findByUserAndBusiness(userId, businessId);
    return favorite !== null;
  }
}