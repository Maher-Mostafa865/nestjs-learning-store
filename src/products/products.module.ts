import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsResolver } from './products.resolver.js';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsResolver,
  ],
})
export class ProductsModule {}
