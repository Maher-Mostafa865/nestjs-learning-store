import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductsService } from './services/products.service.js';

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

  it('findAll returns products ordered by id', async () => {
    const products = [{ id: 1, name: 'Laptop', price: 100 }];
    prisma.product.findMany.mockResolvedValue(products);

    await expect(service.findAll()).resolves.toEqual(products);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
  });

  it('findOne returns a product when found', async () => {
    const product = { id: 1, name: 'Laptop', price: 100 };
    prisma.product.findUnique.mockResolvedValue(product);

    await expect(service.findOne(1)).resolves.toEqual(product);
  });

  it('findOne throws NotFoundException when missing', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create persists a product', async () => {
    const dto = { name: 'Mouse', price: 20 };
    const created = { id: 2, ...dto };
    prisma.product.create.mockResolvedValue(created);

    await expect(service.create(dto)).resolves.toEqual(created);
    expect(prisma.product.create).toHaveBeenCalledWith({ data: dto });
  });

  it('update maps Prisma P2025 to NotFoundException', async () => {
    prisma.product.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.update(99, { name: 'Gone' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove maps Prisma P2025 to NotFoundException', async () => {
    prisma.product.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
