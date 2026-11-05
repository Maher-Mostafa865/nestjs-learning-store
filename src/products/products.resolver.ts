import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service.js';
import { ProductType } from './graphql/product.type.js';
import { ProductInput } from './graphql/product.input.js';

@Resolver()
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Query(() => [ProductType], { name: 'products' })
  findAll() {
    return this.productsService.findAll();
  }


  @Mutation(() => ProductType)
  createProduct(
    @Args('input') input: ProductInput,
  ) {
    return this.productsService.create(input);
  }

  @Mutation(() => Boolean) 
  removeProduct(
    @Args('id',{type: () => Int }) id : number,
  ) : boolean {
    this.productsService.remove(id);
    return true;
  }

  @Query(() => ProductType, { name: 'product' })
  findOne(
    @Args('id',{type: () => Int }) id : number,
  ) {
    return this.productsService.findOne(id);
  }
}


