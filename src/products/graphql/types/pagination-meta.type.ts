import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationMetaType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
