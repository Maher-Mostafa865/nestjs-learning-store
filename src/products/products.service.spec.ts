import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductsService } from './services/products.service.js';

function prismaNotFoundError() {
  return new Prisma.PrismaClientKnownRequestError('Record not found', {
    code: 'P2025',
    clientVersion: 'test',
  });
}

describe('ProductsService', () => {
  let service: ProductsService;

  const prisma = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPaginated', () => {
    it('uses default page=1 and limit=10', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const result = await service.findPaginated({});

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { id: 'asc' },
      });
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('applies custom page and limit with skip/take', async () => {
      const data = [{ id: 11, name: 'Keyboard', price: 50 }];
      prisma.product.findMany.mockResolvedValue(data);
      prisma.product.count.mockResolvedValue(25);

      const result = await service.findPaginated({ page: 3, limit: 5 });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual({
        data,
        meta: {
          total: 25,
          page: 3,
          limit: 5,
          totalPages: 5,
        },
      });
    });

    it('returns empty data with totalPages 0 when there are no products', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await expect(
        service.findPaginated({ page: 1, limit: 10 }),
      ).resolves.toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });
  });

  describe('findOne', () => {
    it('returns an existing product', async () => {
      const product = { id: 1, name: 'Laptop', price: 100 };
      prisma.product.findUnique.mockResolvedValue(product);

      await expect(service.findOne(1)).resolves.toEqual(product);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException when the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('persists a product', async () => {
      const dto = { name: 'Mouse', price: 20 };
      const created = { id: 2, ...dto };
      prisma.product.create.mockResolvedValue(created);

      await expect(service.create(dto)).resolves.toEqual(created);
      expect(prisma.product.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('updates an existing product', async () => {
      const updated = { id: 1, name: 'Laptop Pro', price: 120 };
      prisma.product.update.mockResolvedValue(updated);

      await expect(
        service.update(1, { name: 'Laptop Pro', price: 120 }),
      ).resolves.toEqual(updated);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Laptop Pro', price: 120 },
      });
    });

    it('throws NotFoundException when Prisma returns P2025', async () => {
      prisma.product.update.mockRejectedValue(prismaNotFoundError());

      await expect(
        service.update(99, { name: 'Gone' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rethrows unexpected database errors', async () => {
      const unexpected = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'test' },
      );
      prisma.product.update.mockRejectedValue(unexpected);

      await expect(service.update(1, { name: 'X' })).rejects.toBe(unexpected);
    });
  });

  describe('remove', () => {
    it('deletes an existing product', async () => {
      const deleted = { id: 1, name: 'Laptop', price: 100 };
      prisma.product.delete.mockResolvedValue(deleted);

      await expect(service.remove(1)).resolves.toEqual(deleted);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException when Prisma returns P2025', async () => {
      prisma.product.delete.mockRejectedValue(prismaNotFoundError());

      await expect(service.remove(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rethrows unexpected database errors', async () => {
      const unexpected = new Error('connection refused');
      prisma.product.delete.mockRejectedValue(unexpected);

      await expect(service.remove(1)).rejects.toBe(unexpected);
    });
  });
});
