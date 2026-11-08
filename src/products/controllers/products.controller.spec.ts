import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsService } from '../services/products.service.js';
import { ProductsController } from './products.controller.js';

describe('ProductsController', () => {
  let controller: ProductsController;

  const productsService = {
    findAll: vi.fn(),
    findPaginated: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findAll to findPaginated with the query dto', async () => {
    const query = { page: 2, limit: 5 };
    const response = {
      data: [],
      meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
    };
    productsService.findPaginated.mockResolvedValue(response);

    await expect(controller.findAll(query)).resolves.toEqual(response);
    expect(productsService.findPaginated).toHaveBeenCalledWith(query);
  });
});
