import { Injectable } from 'streetjs';
import { CategoryRepository, Category } from '../repositories/category.repository.js';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getById(id: string): Promise<Category | null> {
    return this.categoryRepo.findById(id);
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepo.findBySlug(slug);
  }

  async getRootCategories(): Promise<Category[]> {
    return this.categoryRepo.findRootCategories();
  }

  async getChildren(parentId: string): Promise<Category[]> {
    return this.categoryRepo.findChildren(parentId);
  }
}