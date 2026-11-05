import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service.js';
import { ProductType } from './graphql/product.type.js';
import { ProductInput } from './graphql/product.input.js';
import { UpdateProductInput } from './graphql/update-product.input.js';

@Resolver()
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Query(() => [ProductType], { name: 'products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Query(() => ProductType, { name: 'product' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => ProductType)
  createProduct(
    @Args('input') input: ProductInput,
  ) {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductType)
  updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productsService.update(id, input);
  }

  @Mutation(() => Boolean)
  async removeProduct(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.productsService.remove(id);
    return true;
  }
}


