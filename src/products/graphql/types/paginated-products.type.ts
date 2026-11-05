import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMetaType } from './pagination-meta.type.js';
import { ProductType } from './product.type.js';

@ObjectType()
export class PaginatedProductsType {
  @Field(() => [ProductType])
  data: ProductType[];

  @Field(() => PaginationMetaType)
  meta: PaginationMetaType;
}
