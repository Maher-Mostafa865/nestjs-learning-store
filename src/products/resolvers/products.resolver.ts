import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginationQueryDto } from '../dto/pagination-query.dto.js';
import { ProductInput } from '../graphql/inputs/product.input.js';
import { UpdateProductInput } from '../graphql/inputs/update-product.input.js';
import { PaginatedProductsType } from '../graphql/types/paginated-products.type.js';
import { ProductType } from '../graphql/types/product.type.js';
import { ProductsService } from '../services/products.service.js';

@Resolver()
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => PaginatedProductsType, { name: 'products' })
  findAll(
    @Args('query', {
      type: () => PaginationQueryDto,
      nullable: true,
    })
    query?: PaginationQueryDto,
  ) {
    return this.productsService.findPaginated(query ?? {});
  }

  @Query(() => ProductType, { name: 'product' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => ProductType)
  createProduct(@Args('input') input: ProductInput) {
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
