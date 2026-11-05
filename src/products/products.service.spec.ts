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

  describe('findAll', () => {
    it('returns products ordered by id', async () => {
      const products = [{ id: 1, name: 'Laptop', price: 100 }];
      prisma.product.findMany.mockResolvedValue(products);

      await expect(service.findAll()).resolves.toEqual(products);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
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
