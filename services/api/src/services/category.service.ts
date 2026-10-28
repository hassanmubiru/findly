import { Injectable } from 'streetjs';
import { CategoryRepository } from '../repositories/category.repository.js';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async getAll(): Promise<CategoryRepository['Category'][]> {
    return this.categoryRepo.findAll();
  }

  async getById(id: string): Promise<CategoryRepository['Category'] | null> {
    return this.categoryRepo.findById(id);
  }

  async getBySlug(slug: string): Promise<CategoryRepository['Category'] | null> {
    return this.categoryRepo.findBySlug(slug);
  }

  async getRootCategories(): Promise<CategoryRepository['Category'][]> {
    return this.categoryRepo.findRootCategories();
  }

  async getChildren(parentId: string): Promise<CategoryRepository['Category'][]> {
    return this.categoryRepo.findChildren(parentId);
  }
}