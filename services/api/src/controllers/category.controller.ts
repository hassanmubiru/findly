import { Controller, Get } from 'streetjs';
import type { StreetContext } from 'streetjs';
import { container } from 'streetjs';
import { CategoryService } from '../services/category.service.js';

@Controller('/api/v1/categories')
export class CategoryController {
  @Get('/')
  async list(ctx: StreetContext): Promise<void> {
    const categoryService = container.resolve<CategoryService>(CategoryService);
    const categories = await categoryService.getAll();
    ctx.json({ categories });
  }

  @Get('/root')
  async listRoot(ctx: StreetContext): Promise<void> {
    const categoryService = container.resolve<CategoryService>(CategoryService);
    const categories = await categoryService.getRootCategories();
    ctx.json({ categories });
  }

  @Get('/:id')
  async getById(ctx: StreetContext): Promise<void> {
    const id = ctx.params['id'];
    const categoryService = container.resolve<CategoryService>(CategoryService);
    const category = await categoryService.getById(id);
    if (!category) {
      ctx.json({ error: 'Category not found' }, 404);
      return;
    }
    ctx.json({ category });
  }

  @Get('/:id/children')
  async getChildren(ctx: StreetContext): Promise<void> {
    const id = ctx.params['id'];
    const categoryService = container.resolve<CategoryService>(CategoryService);
    const children = await categoryService.getChildren(id);
    ctx.json({ categories: children });
  }
}
