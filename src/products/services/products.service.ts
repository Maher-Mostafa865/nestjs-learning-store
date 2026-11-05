import { Injectable, NotFoundException } from '@nestjs/common';
import { isPrismaNotFoundError } from '../../common/prisma/is-prisma-not-found-error.js';
import type { Product } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
      },
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.runOrNotFound(id, () =>
      this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      }),
    );
  }

  async remove(id: number): Promise<Product> {
    return this.runOrNotFound(id, () =>
      this.prisma.product.delete({
        where: { id },
      }),
    );
  }

  /**
   * Runs a Prisma write that fails with P2025 when the row is missing.
   * Maps that expected case to NotFoundException; rethrows everything else.
   */
  private async runOrNotFound(
    id: number,
    operation: () => Promise<Product>,
  ): Promise<Product> {
    try {
      return await operation();
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}
