import { CreateTestInput } from './create-test.input.js';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTestInput extends PartialType(CreateTestInput) {
  @Field(() => Int)
  id: number;
}
