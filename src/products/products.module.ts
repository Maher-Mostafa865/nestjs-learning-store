import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductsController } from './controllers/products.controller.js';
import { ProductPolicy } from './product.policy.js';
import { ProductsResolver } from './resolvers/products.resolver.js';
import { ProductsService } from './services/products.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsResolver, ProductPolicy],
  exports: [ProductsService],
})
export class ProductsModule {}
