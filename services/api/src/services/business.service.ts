import { Injectable } from 'streetjs';
import { BusinessRepository } from '../repositories/business.repository.js';
import { TypesenseService, BusinessDocument } from './typesense.service.js';
import type { StreetContext } from 'streetjs';
import { BadRequestException, NotFoundException } from 'streetjs';

@Injectable()
export class BusinessService {
  constructor(
    private readonly businessRepo: BusinessRepository,
    private readonly typesense: TypesenseService
  ) {}

  async getById(id: string): Promise<BusinessRepository['Business'] | null> {
    return this.businessRepo.findPublishedById(id);
  }

  async getBySlug(slug: string): Promise<BusinessRepository['Business'] | null> {
    return this.businessRepo.findBySlug(slug);
  }

  async list(limit = 20, offset = 0): Promise<{ businesses: BusinessRepository['Business'][]; total: number }> {
    return this.businessRepo.findAllPublished(limit, offset);
  }

  async getByNeighborhood(neighborhoodId: string, limit = 20, offset = 0): Promise<BusinessRepository['Business'][]> {
    return this.businessRepo.findByNeighborhood(neighborhoodId, limit, offset);
  }

  async getByCategory(categoryId: string, limit = 20, offset = 0): Promise<BusinessRepository['Business'][]> {
    return this.businessRepo.findByCategory(categoryId, limit, offset);
  }

  async getCategories(businessId: string): Promise<string[]> {
    return this.businessRepo.getCategoriesForBusiness(businessId);
  }

  async getServices(businessId: string): Promise<string[]> {
    return this.businessRepo.getServicesForBusiness(businessId);
  }

  async create(
    data: {
      name: string;
      slug: string;
      description?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      phone?: string;
      email?: string;
      website?: string;
      city_id?: string;
      neighborhood_id?: string;
      owner_id?: string;
    },
    categoryIds: string[] = []
  ): Promise<BusinessRepository['Business']> {
    const business = await this.businessRepo.create({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      address: data.address ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      status: 'pending',
      verification_status: 'unverified',
      city_id: data.city_id ?? null,
      neighborhood_id: data.neighborhood_id ?? null,
      owner_id: data.owner_id ?? null,
    });

    if (categoryIds.length > 0) {
      await this.indexBusiness(business.id);
    }

    return business;
  }

  async update(
    id: string,
    data: Partial<BusinessRepository['Business']>
  ): Promise<BusinessRepository['Business'] | null> {
    const updated = await this.businessRepo.update(id, data);
    if (updated && updated.status === 'published') {
      await this.indexBusiness(id);
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.businessRepo.delete(id);
    if (deleted) {
      await this.removeFromIndex(id);
    }
    return deleted;
  }

  async indexBusiness(businessId: string): Promise<void> {
    const business = await this.businessRepo.findById(businessId);
    if (!business) return;

    const categoryIds = await this.businessRepo.getCategoriesForBusiness(businessId);
    const serviceNames = await this.businessRepo.getServicesForBusiness(businessId);

    const doc: BusinessDocument = {
      id: business.id,
      name: business.name,
      description: business.description,
      slug: business.slug,
      address: business.address,
      latitude: business.latitude,
      longitude: business.longitude,
      phone: business.phone,
      website: business.website,
      city_id: business.city_id,
      city_name: null,
      neighborhood_id: business.neighborhood_id,
      neighborhood_name: null,
      category_ids: categoryIds,
      category_names: [],
      service_names: serviceNames,
      status: business.status,
      created_at: business.created_at.getTime(),
    };

    try {
      await this.typesense.upsertDocument('businesses', doc);
    } catch (err) {
      console.error(`[search] Failed to index business ${businessId}:`, err);
    }
  }

  async removeFromIndex(businessId: string): Promise<void> {
    try {
      await this.typesense.deleteDocument('businesses', businessId);
    } catch (err) {
      console.error(`[search] Failed to remove business ${businessId} from index:`, err);
    }
  }

  async publish(id: string): Promise<BusinessRepository['Business'] | null> {
    const updated = await this.businessRepo.update(id, { status: 'published' });
    if (updated) {
      await this.indexBusiness(id);
    }
    return updated;
  }

  async unpublish(id: string): Promise<BusinessRepository['Business'] | null> {
    const updated = await this.businessRepo.update(id, { status: 'archived' });
    if (updated) {
      await this.removeFromIndex(id);
    }
    return updated;
  }
}